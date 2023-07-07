import { User } from "./User.js";
import { UserInterface } from "../interfaces.js";

export class Lender extends User {
  constructor(user: UserInterface) {
    super(user);
  }
}
