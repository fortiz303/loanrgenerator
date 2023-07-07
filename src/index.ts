import { Utils } from "./classes/Utils.js";
import { Borrower } from "./classes/Borrower.js";
import { Lender } from "./classes/Lender.js";

let borrower: any;
/*Main function */
async function runLoanGenerator() {
  const config = await Utils.getConfig();
  console.log("start ", new Date());
  /*Create Lenders accounts if they were not created before */
  if (!config.isLendersCreated) {
    let lenders: Lender[] = [];
    const lendersData = await Utils.getUsersData(config.lendersCount);
    if (lendersData) {
      try {
        for await (const userData of lendersData) {
          const normalizedLenderData = await Utils.normalizeUserData(userData);
          const lender = new Lender(normalizedLenderData);
          await lender.signup();
          if (lender.token) {
            lenders.push(lender);
          }
        }
        if (lenders.length) {
          await Utils.createLendersJsonFile(lenders);
        }
      } catch (e: any) {
        await Utils.wrireError(e);
      }
    }
  }
  try {
    /*Create Borrower account */
    const borrowerData = await Utils.getUsersData(1);
    if (borrowerData?.length) {
      const normalizedBorrowerData = await Utils.normalizeUserData(
        borrowerData[0]
      );
      if (!borrower) {
        borrower = borrowerData && new Borrower(normalizedBorrowerData);
        await borrower?.signup();
      }
      /*Borrower publish loan request */
      const loanId = await borrower?.publishLoanRequest();
      if (loanId) {
        const lenders = await Utils.getLenders();
        /*Get random Lender account */
        const lenderData =
          lenders[Utils.getRandomNumber(0, lenders.length - 1)];

        const lender = new Lender(lenderData);
        /*Lender login */
        await lender.login();
        /*Lender grant loan */
        const response = await lender.processLoan(loanId, "grant");

        if (response?.message === "success") {
          /*Borrower confirm loan granting */
          const confirmResponse = await borrower.processLoan(loanId, "confirm");
          if (confirmResponse?.message === "success") {
            /*Lender set loan as paid*/
            await lender.processLoan(loanId, "repaid");
            await Utils.wrireLoanId(loanId);
            borrower = null;
            console.log("finish", new Date());
            setTimeout(() => {
              /*Run script iteration */
              runLoanGenerator();
              //1000 ms * 60 = 1min * 60 = 1 hour
            }, 1000 * 60 * 60 * config.periodInHours);
          }
        }
      }
    }
  } catch (e: any) {
    console.log("restart");
    e.message += "| restarted";
    await Utils.wrireError(e);
    await runLoanGenerator();
  }
}

await runLoanGenerator();
