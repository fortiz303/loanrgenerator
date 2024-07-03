import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config();

import { Utils } from "./classes/Utils.js";

let borrowerID: string = "";
let loanID: string = "";
const MONGO_STRING = process.env.MONGO_STRING!;
/*Main function */
async function runLoanGenerator() {
  if (!MONGO_STRING) {
    console.log(
      'Mongo DB connection string is missed. Paste it into .env file, filed "MONGO_STRING ="'
    );
    return;
  }
  /*Get config */
  const config = await Utils.getConfig();
  console.log("start ", new Date());

  try {
    /*Establishing a connection to the database */
    await mongoose.connect(MONGO_STRING).then(() => {
      console.log("Connected to MongoDB");
    });
    /*Get User collection */
    const userCollection = mongoose.connection.db.collection("users");
    /*Get Loans collection */
    const loansCollection = mongoose.connection.db.collection("loans");
    /*Create Lenders accounts if they were not created before */
    if (!config.isLendersCreated) {
      /*Get lender/s data */
      const lendersData = await Utils.getUserData(config.lendersCount);
      if (lendersData) {
        /*Create lender/s db record/s */
        const lendersCreateResponse = await userCollection.insertMany(
          lendersData
        );
        const lendersIDs = Object.values(lendersCreateResponse.insertedIds).map(
          (BSONId) => BSONId.toString()
        );
        /*Write lenders ids to the file */
        await Utils.createLendersJsonFile(lendersIDs);
      }
    }
    let borrowerData;
    if (!borrowerID) {
      /*Get borrower data */
      borrowerData = await Utils.getUserData(1);
      /*Create borrower db record */
      const borrowerCreateResponse = await userCollection.insertOne(
        borrowerData![0]
      );
      borrowerID = borrowerCreateResponse.insertedId.toString();
    }
    if (borrowerData && borrowerID && !loanID) {
      /*Get loan data */
      const loanData = Utils.getLoanData({
        ...borrowerData[0],
        id: borrowerID,
      })!;
      /*Create new loan db record */
      const loanResponse = await loansCollection.insertOne(loanData);
      loanID = loanResponse.insertedId.toString();
    }
    if (loanID) {
      /*Setting the timer for the loan processing */
      setTimeout(
        async () => {
          try {
            /*Get all lenders  */
            const lenders = await Utils.getLenders();
            /*Get random lender id */
            const lenderID: string =
              lenders[Utils.getRandomNumber(0, lenders.length - 1)];
            /*Update loan with status "paid" */

            const updatedLoan = await loansCollection.updateOne(
              {
                _id: new mongoose.Types.ObjectId(loanID),
              },
              {
                $set: {
                  granted_by: new mongoose.Types.ObjectId(lenderID),
                  isGrantingConfirmed: true,
                  status: "paid",
                  isRepaid: true,
                  updatedAt: new Date(),
                },
              }
            );
            /*When the update is successful */
            if (updatedLoan.modifiedCount === 1) {
              /*Close db connection */
              mongoose.connection.close();
              /*Write loan id to the file */
              await Utils.wrireLoanId(loanID);
              loanID = "";
              borrowerID = "";
              /*Setting the timer for the new generator itteration */
              setTimeout(
                async () => {
                  await runLoanGenerator();
                },
                //1000 ms * 60 = 1min * 60 = 1 hour
                1000 * 60 * 60 * config.intervalInHours
              );
              console.log("finish ", new Date());
            }
          } catch (e: any) {
            if (loanID && borrowerID) {
              e.message += "| restarted";
              await Utils.wrireError(e);
              await runLoanGenerator();
            }
          }
        },
        /*A published loan request will be filled within 2 minutes */
        1000 * 60 * 2
      );
    }
  } catch (e: any) {
    e.message += "| restarted";
    await Utils.wrireError(e);
    if (loanID && borrowerID) {
      await runLoanGenerator();
    }
  }
}

await runLoanGenerator();
