import BaseRepository from './BaseRepository';

export default abstract class BaseService<T> {
  protected repository: BaseRepository<T>;

  constructor(repository: BaseRepository<T>) {
    this.repository = repository;
  }

  async getById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  async getMany(where?: any, skip?: number, take?: number): Promise<T[]> {
    return this.repository.findMany(where, skip, take);
  }

  async getTotal(where?: any): Promise<number> {
    return this.repository.count(where);
  }

  async create(data: any): Promise<T> {
    return this.repository.create(data);
  }

  async update(id: string, data: any): Promise<T> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  async getOne(where: any): Promise<T | null> {
    return this.repository.findOne(where);
  }

  protected getPaginationParams(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  protected getPaginatedResponse<U>(items: U[], total: number, page: number, limit: number) {
    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
