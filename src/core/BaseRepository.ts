export default abstract class BaseRepository<T> {
  protected model: any;

  constructor(model: any) {
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  async findMany(where?: any, skip?: number, take?: number): Promise<T[]> {
    return this.model.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } });
  }

  async count(where?: any): Promise<number> {
    return this.model.count({ where });
  }

  async create(data: any): Promise<T> {
    return this.model.create({ data });
  }

  async update(id: string, data: any): Promise<T> {
    return this.model.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.model.delete({ where: { id } });
  }

  async findOne(where: any): Promise<T | null> {
    return this.model.findFirst({ where });
  }

  async upsert(where: any, create: any, update: any): Promise<T> {
    return this.model.upsert({ where, create, update });
  }
}
