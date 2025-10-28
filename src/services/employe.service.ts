import { employeModel, EmployeEntity } from "@/models/employe.model";

export const employeService = {
  async list(): Promise<EmployeEntity[]> {
    return employeModel.findAll();
  },

  async get(id: string): Promise<EmployeEntity | null> {
    return employeModel.findById(id);
  },

  async create(employe: Omit<EmployeEntity, 'id'>): Promise<EmployeEntity> {
    return employeModel.create(employe);
  },

  async update(id: string, employe: Partial<EmployeEntity>): Promise<boolean> {
    return employeModel.update(id, employe);
  },

  async delete(id: string): Promise<boolean> {
    return employeModel.delete(id);
  },
};


// import { employeModel, EmployeEntity } from "@/models/employe.model";

// export const employeService = {
//   async list(): Promise<EmployeEntity[]> {
//     return employeModel.findAll();
//   },

//   async get(id: string): Promise<EmployeEntity | null> {
//     return employeModel.findById(id);
//   },
// };
