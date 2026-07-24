import {
  getForegroundLocationConsistencyCheck,
  runForegroundLocationConsistencyCheck,
} from '@/lib/location-consistency';

describe('foreground location consistency check', () => {
  it('requires broad confirmed and observed area labels', () => {
    const result = runForegroundLocationConsistencyCheck({
      confirmedNeighborhood: '',
      confirmedCity: 'Accra',
      observedAreaLabel: '',
    });

    expect(result.check).toBeUndefined();
    expect(result.errors).toContain('Confirmed neighborhood is required.');
    expect(result.errors).toContain('Observed broad area label is required.');
  });

  it('marks matching broad area labels as consistent without storing exact coordinates', () => {
    const result = runForegroundLocationConsistencyCheck({
      confirmedNeighborhood: 'East Legon',
      confirmedCity: 'Accra',
      observedAreaLabel: 'Near East Legon, Accra',
    });

    expect(result.errors).toEqual([]);
    expect(result.check?.status).toBe('consistent');
    expect(result.check?.checkMode).toBe('foreground_user_triggered');
    expect(result.check?.backgroundTrackingUsed).toBe(false);
    expect(result.check?.exactCoordinatesStored).toBe(false);
    expect(result.check?.exactCoordinatesPublic).toBe(false);
    expect(result.check?.provesResidence).toBe(false);
    expect(result.check?.aiFinalDecision).toBe(false);
    expect(result.check?.humanReviewRequired).toBe(false);
    expect(getForegroundLocationConsistencyCheck()?.status).toBe('consistent');
  });

  it('sends mismatched broad area labels to human review instead of final failure', () => {
    const result = runForegroundLocationConsistencyCheck({
      confirmedNeighborhood: 'East Legon',
      confirmedCity: 'Accra',
      observedAreaLabel: 'Kumasi central area',
    });

    expect(result.check?.status).toBe('needs_human_review');
    expect(result.check?.humanReviewRequired).toBe(true);
    expect(result.check?.provesResidence).toBe(false);
  });
});
