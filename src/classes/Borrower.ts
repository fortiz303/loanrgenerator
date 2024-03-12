import { User } from "./User.js";
import { LoanRequest } from "./LoanRequest.js";
import { LoanRequestInterface, UserInterface } from "../interfaces.js";
import { Utils } from "./Utils.js";

const config = await Utils.getConfig();

export class Borrower extends User {
  constructor(user: UserInterface) {
    super(user);
  }
  /*Publish loan request */
  public async publishLoanRequest() {
    const requestedAmount = Utils.generateRequestAmount();
    /*Payback base: requested amount + random range[15%-25%] */
    const basePayback =
      requestedAmount * (Utils.getRandomNumber(105, 120) / 100);
    /*Round payback amount for ending with 0 */
    const paybackAmount = Math.round(basePayback / 10) * 10;
    const loan = new LoanRequest(
      this.location!,
      requestedAmount,
      paybackAmount
    );
    const loanRequest = await loan.createRequest();

    const formData = new FormData();
    /*Create loan request form data */
    let key: keyof LoanRequestInterface;
    for (key in loanRequest) {
      if (key === "collateral") {
        formData.append(key, JSON.stringify(loanRequest[key]));
      } else {
        formData.append(key, loanRequest[key]?.toString()!);
      }
    }

    const file = (await Utils.getPaystubsImages()) as Blob;
    formData.append("paystubsFiles", file, "testfile.png");
    try {
      /*Send create loan request to the server */
      const response = await fetch(`${config.apiUrl}/loans/1`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        body: formData,
      });
      const { loan } = await response.json();

      if (response.statusText === "OK") {
        return loan.id;
      } else {
        throw Error("create loan error");
      }
    } catch (e: any) {
      throw e;
    }
    return;
  }
}
