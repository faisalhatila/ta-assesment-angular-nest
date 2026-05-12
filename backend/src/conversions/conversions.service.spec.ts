import { ConversionsService } from './conversions.service';

describe('ConversionsService', () => {
  it('returns rate for a supported currency pair', async () => {
    const currencyService = {
      getLatestPair: jest.fn().mockResolvedValue({ data: { PKR: 278.5 } }),
      getHistoricalPair: jest.fn(),
    };
    const usersService = {
      areCurrenciesSupported: jest.fn().mockResolvedValue(true),
      getAdminClient: () => ({
        from: () => ({
          insert: () => ({
            select: () => ({
              single: jest.fn().mockResolvedValue({
                data: { id: 1, created_at: '2026-01-01T00:00:00.000Z' },
                error: null,
              }),
            }),
          }),
        }),
      }),
    };

    const service = new ConversionsService(
      currencyService as any,
      usersService as any,
    );
    const output = await service.convert(
      { from: 'usd', to: 'pkr', amount: 10 },
      {
        id: 'u1',
        email: 'a@b.com',
        role: 'user',
        token: 'x',
      },
      'abc123abc123abc123abc123abc123ab',
    );

    expect(currencyService.getLatestPair).toHaveBeenCalledWith('USD', 'PKR');
    expect(output.rate).toBe(278.5);
    expect(output.convertedAmount).toBe(2785);
  });
});
