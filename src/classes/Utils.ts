import { writeFile, readFile, appendFile } from "node:fs/promises";
import { Lender } from "./Lender.js";

import { faker } from "@faker-js/faker";

import path from "path";
import { join } from "node:path";
import { cities } from "../cities.js";
const __dirname = path.resolve();

export class Utils {
  /*Write error to error.log file */
  static async wrireError(e: any) {
    appendFile(
      path.join(__dirname, "/error.log"),
      JSON.stringify({ error: e.message, time: new Date() })
    );
  }
  /*Write created loans id to loans.log file */
  static async wrireLoanId(loanId: string) {
    appendFile(
      path.join(__dirname, "/loans.log"),
      JSON.stringify({ loanId: loanId, time: new Date() })
    );
  }
  /*Get loan request amount */
  static generateRequestAmount() {
    let baseNumber = Utils.getRandomNumber(10, 60);
    /*Base requested amount - random range [$100-$900] */
    const baseAmount =
      Math.random() < 0.5 ? (baseNumber *= 10) : (baseNumber *= 15);
    /*Get random request amount end number - 5 or 0, for example:$100,$255,etc */
    const randomAmoutEnd = Math.random() < 0.5 ? 5 : 10;
    /*Get rounded request amount with specified end number 5 or 0 */
    const requesteAmount =
      Math.round(baseAmount / randomAmoutEnd) * randomAmoutEnd;
    return requesteAmount;
  }
  /*Get payback date */
  static getPaybackDate() {
    let date = new Date();
    /*Get random payback date: today + random range [7-30days] */
    date.setDate(date.getDate() + Utils.getRandomNumber(7, 30));
    return date.toISOString();
  }
  /*Get config from config.json file */
  static async getConfig() {
    const configFile = await readFile("./config.json", "utf-8");
    const config = JSON.parse(configFile);
    return config;
  }
  /*Get saved Lenders */
  static async getLenders() {
    const lendersList = await readFile("./lenders.json", "utf-8");
    const lenders = JSON.parse(lendersList);
    return lenders;
  }

  /*Get user data from API */
  static async getUsersData(count: number) {
    let users = [];
    try {
      for (let u of Array.from({ length: count })) {
        let username = "";
        while (username.length < 5 || username.length > 10) {
          username = faker.internet.userName().toLowerCase();
        }

        const randomCityIndex = this.getRandomNumber(0, cities.length - 1);
        users.push({
          name: faker.person.fullName(),
          email: username + "@getloanr.com",
          password: faker.internet.password(),
          contact: "+15555555555",
          username,
          location: cities[randomCityIndex],
        });
      }

      return users;
    } catch (e: any) {
      Utils.wrireError(e);
    }
  }
  /*Get random number from specified range */
  static getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  /*Save Lenders to lenders.json file for future usage */
  static async createLendersJsonFile(lenders: Lender[]) {
    if (lenders?.length) {
      try {
        await writeFile("lenders.json", JSON.stringify(lenders));
        const config = await Utils.getConfig();
        config.isLendersCreated = true;
        await writeFile("config.json", JSON.stringify(config));
      } catch (e: any) {
        appendFile(
          "error.log",
          JSON.stringify({ error: e.message, time: new Date() })
        );
      }
    }
  }
  /*Get paystub images */
  static async getPaystubsImages() {
    try {
      const filePath = join(__dirname, "src", "paystubs/p1.png");

      let b = await readFile(filePath);
      const c = new Blob([b], { type: "image/png" });

      return c;
    } catch (e: any) {
      appendFile(
        "error.log",
        JSON.stringify({ error: e.message, time: new Date() })
      );
    }
  }
}
