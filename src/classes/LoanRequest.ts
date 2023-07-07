import { Page, firefox } from "playwright";

import { Utils } from "./Utils.js";
import { LoanCollateral, LoanRequestInterface } from "../interfaces.js";

export class LoanRequest {
  borrowerLocation: string;
  query: { title: string; categoryId: number };
  requestedAmount: number;
  paybackAmount: number;

  constructor(
    borrowerLocation: string,
    query: { title: string; categoryId: number },
    requestedAmount: number,
    paybackAmount: number
  ) {
    this.borrowerLocation = borrowerLocation;
    this.query = query;
    this.requestedAmount = requestedAmount;
    this.paybackAmount = paybackAmount;
  }

  /*Create page for Ebay parsing */
  static async createPage() {
    const browser = await firefox.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    return page;
  }
  /*Get specific Ebay page */
  public getCollateralListUrl() {
    /*Get random page number */
    const page = Utils.getRandomNumber(1, 40);
    /*Max. collateral price: payback amount + random range [15%-30%] */
    const maxPrice =
      this.paybackAmount * (Utils.getRandomNumber(115, 130) / 100);

    return `https://www.ebay.com/sch/i.html?_from=R40&_nkw=${this.query.title}&_sacat=0&rt=nc&LH_ItemCondition=4&_pgn=${page}&_udlo=${this.requestedAmount}&_udhi=${maxPrice}`;
  }
  /*Get random item from Ebay search results */
  public async getRandomCollateralItemUrl(page: Page) {
    await page.goto(this.getCollateralListUrl());
    /*Get random item index from Ebay search results*/
    const randomItemIndex = Utils.getRandomNumber(1, 60);

    let href;

    href = await page.evaluate((randomItemIndex) => {
      const allProducts = document.querySelectorAll(
        ".s-item__image a"
      ) as NodeListOf<HTMLAnchorElement>;
      return allProducts[randomItemIndex].href;
    }, randomItemIndex);

    return href;
  }
  /*Get image urls from Ebay item */
  public async getCollateralImagesUrls(page: Page) {
    const imageElementUrls = await page.evaluate(async () => {
      /*Get all images list */
      const imgEls = document.querySelectorAll(
        ".ux-image-carousel-item img"
      ) as NodeListOf<HTMLImageElement>;
      let imagesUrls: string[] = [];

      for await (const image of imgEls) {
        /*Get image link */
        let srcString = image.src;
        if (!srcString) {
          srcString = image.dataset.src!;
        }
        imagesUrls.push(srcString!);
      }

      return imagesUrls;
    });

    await page.close();
    return imageElementUrls;
  }
  /*Get image data by url */
  public async getImageFileByUrl(url: string) {
    const response = await fetch(url);
    const data = await response.blob();

    return data;
  }

  public async createRequest(): Promise<LoanRequestInterface> {
    let collateral = {} as LoanCollateral;
    const page = await LoanRequest.createPage();
    /*Get random Ebay page with search results for specified collateral title  */
    const href = await this.getRandomCollateralItemUrl(page);
    /*Go to Ebay url from previous step */
    await page.goto(href);
    /*Get item title from Ebay */
    const collateralTitle = await page.evaluate(
      () => document.querySelector(".x-item-title__mainTitle span")?.textContent
    );

    const splitedTitle = collateralTitle?.trim().split(" ");
    /*Loan request collateral title - up to 3 words  */
    collateral.title = `${splitedTitle?.[0]} ${splitedTitle?.[1]} ${splitedTitle?.[2]}`;
    /*Loan request collateral title - full title from Ebay */
    collateral.description = collateralTitle!;

    /*Images */
    let imagesUrls = await this.getCollateralImagesUrls(page);
    /*Get random image count for loan request */
    let imageCount = Utils.getRandomNumber(1, 3);
    const images = [];
    /*Save images as files */
    while (imageCount) {
      let imgBlob: Blob;
      if (imagesUrls.length < 4) {
        for await (let url of imagesUrls) {
          imgBlob = await this.getImageFileByUrl(url);
        }
      } else {
        const imageIndex = Utils.getRandomNumber(0, imagesUrls.length - 1);

        imgBlob = await this.getImageFileByUrl(imagesUrls[imageIndex]);
        imagesUrls = imagesUrls.filter((url) => url !== imagesUrls[imageIndex]);
      }
      images.push(imgBlob!);

      imageCount--;
    }

    page.close();

    return {
      requestedAmount: this.requestedAmount,
      paybackAmount: this.paybackAmount,
      collateral,
      date: Utils.getPaybackDate(),
      borrowerLocation: this.borrowerLocation,
      status: "published",
      isCollateralExist: true,
      images,
    };
  }
}
