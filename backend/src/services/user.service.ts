import { User } from '../models/User';
import { UserRole } from '../utils/constants';

export class UserService {
   
  static async listAgents() {
    return User.find({ role: UserRole.AGENT, isActive: true })
      .select('name email')
      .sort({ name: 1 })
      .lean();
  }
}
