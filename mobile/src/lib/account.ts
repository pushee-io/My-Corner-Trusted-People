export type VerificationStatus = 'verified' | 'needs_review' | 'not_started' | 'not_available';

export type VerificationItem = {
  id: string;
  label: string;
  status: VerificationStatus;
  detail: string;
};

export const requesterProfile = {
  name: 'Akosua Mensah',
  role: 'Requester',
  neighborhood: 'East Legon',
  city: 'Accra',
  country: 'Ghana',
  phone: '+233 24 000 0000',
  email: 'akosua.test@example.com',
  language: 'English',
  dataSaver: true,
};

export const verificationItems: VerificationItem[] = [
  {
    id: 'phone',
    label: 'Phone verified',
    status: 'verified',
    detail: 'Seeded test phone is marked verified for prototype testing.',
  },
  {
    id: 'email',
    label: 'Email added',
    status: 'verified',
    detail: 'Seeded test email is present. No real email has been sent.',
  },
  {
    id: 'location',
    label: 'Neighborhood confirmed',
    status: 'verified',
    detail: 'East Legon is selected as the general service area.',
  },
  {
    id: 'ghana-post-gps',
    label: 'GhanaPost GPS',
    status: 'not_started',
    detail: 'Optional. Exact digital address is not public in this prototype.',
  },
  {
    id: 'identity',
    label: 'Identity check',
    status: 'not_available',
    detail: 'Not active for Day 2. Requires founder approval, legal review, and an approved provider.',
  },
];
