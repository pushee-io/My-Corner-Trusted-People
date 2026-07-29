import fs from 'node:fs';

import {
  getMediaPipelinePolicy,
  prepareMediaAttachments,
  toUserUploadedImage,
  type MediaSurface,
} from '@/lib/shared-media-pipeline';

describe('shared media pipeline foundation', () => {
  const createdAt = '2026-07-29T12:34:56.000Z';
  const ownerProfileId = 'profile-akosua';
  const surfaces: MediaSurface[] = [
    'service_request',
    'report',
    'neighborhood_post',
    'group_post',
    'marketplace_listing',
    'event',
  ];

  it('defines one shared policy shape for requests, reports, posts, marketplace, and events', () => {
    expect(getMediaPipelinePolicy('service_request')).toMatchObject({
      bucket: 'request-images',
      maxFiles: 4,
      maxBytesPerFile: 6 * 1024 * 1024,
      purpose: 'job_photo',
    });
    expect(getMediaPipelinePolicy('report')).toMatchObject({
      bucket: 'report-images',
      maxFiles: 6,
      maxBytesPerFile: 8 * 1024 * 1024,
      purpose: 'safety_evidence',
    });
    expect(getMediaPipelinePolicy('neighborhood_post')).toMatchObject({
      bucket: 'feed-post-images',
      maxFiles: 4,
      purpose: 'community_photo',
    });
    expect(getMediaPipelinePolicy('group_post')).toMatchObject({
      bucket: 'group-post-images',
      maxFiles: 4,
      purpose: 'community_photo',
    });
    expect(getMediaPipelinePolicy('marketplace_listing')).toMatchObject({
      bucket: 'listing-images',
      maxFiles: 8,
      purpose: 'listing_photo',
    });
    expect(getMediaPipelinePolicy('event')).toMatchObject({
      bucket: 'event-images',
      maxFiles: 6,
      purpose: 'event_photo',
    });

    for (const surface of surfaces) {
      expect(getMediaPipelinePolicy(surface).allowedMimeTypes).toEqual([
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif',
      ]);
    }
  });

  it('prepares safe pending attachments for every supported surface without enabling uploads', () => {
    for (const surface of surfaces) {
      const result = prepareMediaAttachments({
        surface,
        ownerProfileId,
        createdAt,
        attachments: [
          {
            uri: 'file:///tmp/photo.jpg',
            fileName: 'kitchen sink.jpg',
            mimeType: 'image/jpeg',
            byteSize: 128_000,
            width: 1200,
            height: 900,
            altText: 'Loose pipe under the kitchen sink',
          },
        ],
      });

      expect(result.accepted).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.attachments).toEqual([
        expect.objectContaining({
          id: `${surface}-20260729123456-1`,
          surface,
          bucket: getMediaPipelinePolicy(surface).bucket,
          objectPath: `${surface}/profile-akosua/20260729123456/media-1.jpg`,
          moderationStatus: 'not_run',
          uploadStatus: 'pending',
          altText: 'Loose pipe under the kitchen sink',
          createdAt,
        }),
      ]);
    }
  });

  it('rejects too many files for the selected surface', () => {
    const result = prepareMediaAttachments({
      surface: 'service_request',
      ownerProfileId,
      createdAt,
      attachments: Array.from({ length: 5 }, (_, index) => ({
        uri: `file:///tmp/photo-${index}.jpg`,
        mimeType: 'image/jpeg',
        byteSize: 128_000,
      })),
    });

    expect(result.accepted).toBe(false);
    expect(result.errors).toContainEqual(expect.objectContaining({ code: 'too_many_files', index: 4 }));
  });

  it('rejects invalid local media drafts before upload code can run', () => {
    const result = prepareMediaAttachments({
      surface: 'report',
      ownerProfileId,
      createdAt,
      attachments: [
        { uri: '', mimeType: 'image/jpeg', byteSize: 128_000 },
        { uri: 'file:///tmp/video.mp4', mimeType: 'video/mp4', byteSize: 128_000 },
        { uri: 'file:///tmp/empty.jpg', mimeType: 'image/jpeg', byteSize: 0 },
        { uri: 'file:///tmp/huge.jpg', mimeType: 'image/jpeg', byteSize: 9 * 1024 * 1024 },
      ],
    });

    expect(result.accepted).toBe(false);
    expect(result.attachments).toEqual([]);
    expect(result.errors.map((error) => error.code)).toEqual([
      'missing_uri',
      'unsupported_mime_type',
      'invalid_file_size',
      'file_too_large',
    ]);
  });

  it('does not leak original filenames or sensitive alt text into safe stored payloads', () => {
    const result = prepareMediaAttachments({
      surface: 'marketplace_listing',
      ownerProfileId: 'Akosua Legal Name +233 0244000000',
      createdAt,
      attachments: [
        {
          uri: 'file:///tmp/photo.jpg',
          fileName: '+233000000000 exact-address GhanaPost GPS legal-name challenge-hash.jpg',
          mimeType: 'image/png',
          byteSize: 128_000,
          altText:
            'Call +233244000000 or email akosua@example.com at GA-123-4567, exact address, legal name, challenge hash',
        },
      ],
    });

    expect(result.accepted).toBe(true);
    expect(result.attachments[0]).toMatchObject({
      objectPath: 'marketplace_listing/akosua-legal-name-233-0244000000/20260729123456/media-1.png',
      altText: undefined,
    });

    const persisted = toUserUploadedImage(result.attachments[0], ownerProfileId);
    const serializedPayload = JSON.stringify(persisted);

    expect(serializedPayload).not.toContain('fileName');
    expect(serializedPayload).not.toContain('+233000000000');
    expect(serializedPayload).not.toContain('akosua@example.com');
    expect(serializedPayload).not.toContain('GA-123-4567');
    expect(serializedPayload).not.toContain('exact address');
    expect(serializedPayload).not.toContain('challenge hash');
  });

  it('maps prepared attachments to the shared user image contract without public urls', () => {
    const result = prepareMediaAttachments({
      surface: 'event',
      ownerProfileId,
      createdAt,
      attachments: [
        {
          uri: 'file:///tmp/event.webp',
          mimeType: 'image/webp',
          byteSize: 128_000,
          altText: 'Community clean-up flyer',
        },
      ],
    });

    expect(toUserUploadedImage(result.attachments[0], ownerProfileId)).toEqual({
      id: 'event-20260729123456-1',
      bucket: 'event-images',
      path: 'event/profile-akosua/20260729123456/media-1.webp',
      ownerId: ownerProfileId,
      altText: 'Community clean-up flyer',
      moderationStatus: 'not_run',
      createdAt,
    });
  });

  it('keeps the pipeline read-only with no storage, Supabase, or device upload APIs wired', () => {
    const source = fs.readFileSync('src/lib/shared-media-pipeline.ts', 'utf8');

    expect(source).not.toContain('supabase');
    expect(source).not.toContain('.upload(');
    expect(source).not.toContain('.insert(');
    expect(source).not.toContain('.update(');
    expect(source).not.toContain('.delete(');
    expect(source).not.toContain('ImagePicker');
    expect(source).not.toContain('FileSystem');
    expect(source).not.toContain('getCurrentPosition');
    expect(source).not.toContain('requestMediaLibraryPermissions');
  });
});
