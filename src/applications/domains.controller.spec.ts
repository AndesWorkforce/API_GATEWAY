import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';

import { DomainsController } from './domains.controller';

describe('DomainsController', () => {
  let controller: DomainsController;
  let client: jest.Mocked<ClientProxy>;

  const mockClient = {
    send: jest.fn(),
  } as unknown as jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DomainsController],
      providers: [
        {
          provide: 'USER_SERVICE',
          useValue: mockClient,
        },
      ],
    }).compile();

    controller = module.get<DomainsController>(DomainsController);
    client = module.get('USER_SERVICE');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const createDomainDto = { name: 'domain.com', category: 'productive' };
      const expectedResponse = { id: 'domain-1', ...createDomainDto };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.create(createDomainDto);

      expect(client.send).toHaveBeenCalledWith('createDomain', createDomainDto);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findAll', () => {
    it('delegates to USER_SERVICE with correct pattern', () => {
      const expectedResponse = [{ id: 'domain-1', name: 'domain.com' }];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findAll();

      expect(client.send).toHaveBeenCalledWith('findAllDomains', {});
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findOne', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'domain-123';
      const expectedResponse = { id, name: 'domain.com' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findOne(id);

      expect(client.send).toHaveBeenCalledWith('findDomainById', id);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('update', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const id = 'domain-123';
      const updateDomainDto = { name: 'updated.com' };
      const expectedResponse = { id, ...updateDomainDto };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.update(id, updateDomainDto);

      expect(client.send).toHaveBeenCalledWith('updateDomain', {
        id,
        updateDomainDto,
      });
      expect(result).toBe(expectedResponse);
    });
  });

  describe('remove', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'domain-123';
      const expectedResponse = { message: 'Domain deleted' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.remove(id);

      expect(client.send).toHaveBeenCalledWith('removeDomain', id);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('assignDomainsToContractor', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const contractorId = 'contractor-123';
      const body = { domain_ids: ['d1.com', 'd2.com'] };
      const expectedResponse = { message: 'Domains assigned' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.assignDomainsToContractor(contractorId, body);

      expect(client.send).toHaveBeenCalledWith('assignDomainsToContractor', {
        contractorId,
        assignDomainsDto: body,
      });
      expect(result).toBe(expectedResponse);
    });
  });

  describe('getDomainsByContractor', () => {
    it('delegates to USER_SERVICE with correct pattern and contractorId', () => {
      const contractorId = 'contractor-123';
      const expectedResponse = [{ id: 'domain-1' }];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.getDomainsByContractor(contractorId);

      expect(client.send).toHaveBeenCalledWith(
        'getDomainsByContractor',
        contractorId,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('removeDomainsFromContractor', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const contractorId = 'contractor-123';
      const body = { domain_ids: ['d1.com', 'd2.com'] };
      const expectedResponse = { message: 'Domains removed' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.removeDomainsFromContractor(contractorId, body);

      expect(client.send).toHaveBeenCalledWith('removeDomainsFromContractor', {
        contractorId,
        assignDomainsDto: body,
      });
      expect(result).toBe(expectedResponse);
    });
  });
});
