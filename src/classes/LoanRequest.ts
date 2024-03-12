import { Utils } from "./Utils.js";
import { LoanCollateral, LoanRequestInterface } from "../interfaces.js";

import { descriptions } from "../descriptions.js";

export class LoanRequest {
  borrowerLocation: string;
  requestedAmount: number;
  paybackAmount: number;

  constructor(
    borrowerLocation: string,
    requestedAmount: number,
    paybackAmount: number
  ) {
    this.borrowerLocation = borrowerLocation;
    this.requestedAmount = requestedAmount;
    this.paybackAmount = paybackAmount;
  }

  public async createRequest(): Promise<LoanRequestInterface> {
    let collateral = {} as LoanCollateral;

    /*Loan request collateral title - up to 3 words  */
    collateral.title = "";
    /*Loan request collateral title - full title from Ebay */
    collateral.description =
      descriptions[Utils.getRandomNumber(0, descriptions.length - 1)];

    return {
      requestedAmount: this.requestedAmount,
      paybackAmount: this.paybackAmount,
      collateral,
      date: Utils.getPaybackDate(),
      borrowerLocation: this.borrowerLocation,
      status: "published",
      isCollateralExist: true,
    };
  }
}
