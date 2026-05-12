import { CurrencyController } from './currency.controller';

describe('CurrencyController', () => {
  it('returns symbols from service', async () => {
    const service = {
      getSymbols: jest
        .fn()
        .mockResolvedValue({ data: { USD: { symbol: '$' } } }),
      getLatest: jest.fn(),
      getHistorical: jest.fn(),
    };
    const usersService = {
      getSupportedCurrencies: jest.fn(),
    };
    const controller = new CurrencyController(
      service as any,
      usersService as any,
    );
    await expect(controller.getSymbols()).resolves.toEqual({
      data: { USD: { symbol: '$' } },
    });
  });
});
