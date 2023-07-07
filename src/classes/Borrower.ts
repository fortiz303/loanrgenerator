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
    const queryIndex = Utils.getRandomNumber(0, config.queries.length - 1);
    /*Get random collateral query */
    const query = config.queries[queryIndex];
    query.title = query.title.split(" ").join("+");

    const requestedAmount = Utils.generateRequestAmount();
    /*Payback base: requested amount + random range[15%-25%] */
    const basePayback =
      requestedAmount * (Utils.getRandomNumber(115, 125) / 100);
    /*Round payback amount for ending with 0 */
    const paybackAmount = Math.round(basePayback / 10) * 10;
    const loan = new LoanRequest(
      this.location!,
      query,
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
      } else if (key === "images" && loanRequest[key]) {
        for (let image of loanRequest[key]!) {
          formData.append(
            "images",
            image,
            `${loanRequest.collateral.title}.png` //Image title
          );
        }
      } else {
        formData.append(key, loanRequest[key]?.toString()!);
      }
    }

    try {
      /*Send create loan request to the server */
      const response = await fetch(`${config.apiUrl}/loans`, {
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
        console.log("RESPONSE ERR", response);
        throw Error("create loan error");
      }
    } catch (e: any) {
      throw e;
    }
    return;
  }
}
