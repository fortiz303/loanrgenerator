import { Utils } from "./Utils.js";
import { UserInterface } from "../interfaces.js";

const config = await Utils.getConfig();

const headers = {
  Accept: "application/json, text/plain, */*",
  "Content-Type": "application/json",
};

export class User implements UserInterface {
  name: string;
  email: string;
  contact: string;
  username: string;
  password: string;
  location: string;
  token?: string;

  constructor(user: UserInterface) {
    this.name = user.name;
    this.email = user.email;
    this.password = user.password;
    this.contact = user.contact;
    this.username = user.username;
    this.location = user.location;
  }
  /*User signup */
  public async signup() {
    const signupData = {
      name: this.name,
      username: this.username,
      email: this.email,
      contact: this.contact,
      password: this.password,
    };

    try {
      /*Register new user */
      const response = await fetch(`${config.apiUrl}/auth/register`, {
        method: "POST",
        headers,
        body: JSON.stringify(signupData),
      });
      const responseData = await response.json();

      if (response.statusText === "OK") {
        /*Update profile with avatar */
        this.token = responseData.token;

        return true;
      } else {
        return null;
      }
    } catch (e: any) {
      Utils.wrireError(e);
    }
  }
  /*User login */
  public async login(
    email: string = this.email,
    password: string = this.password
  ) {
    try {
      const response = await fetch(`${config.apiUrl}/auth/login`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const authUser = await response.json();

      if (response.statusText === "OK") {
        this.token = authUser.token;
      } else {
        return null;
      }
    } catch (e: any) {
      Utils.wrireError(e);
    }
  }
  /*Handle Borrower and Lender loan events: grant, confirm granting, repaid */
  public async processLoan(
    loanId: string,
    type: "confirm" | "grant" | "repaid"
  ) {
    try {
      const response = await fetch(
        `${config.apiUrl}/loans/${loanId}?type=${type}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      const loan = await response.json();

      if (loan.id) {
        return { message: "success" };
      } else {
        throw Error("Processing loan error");
      }
    } catch (e: any) {
      Utils.wrireError(e);
    }
  }
}
