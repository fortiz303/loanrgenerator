export interface UserData {
  gender: string;
  name: { title: string; first: string; last: string };
  location: {
    street: { number: number; name: string };
    city: string;
    state: string;
    country: string;
    postcode: number;
    coordinates: { latitude: string; longitude: string };
    timezone: {
      offset: string;
      description: string;
    };
  };
  email: string;
  login: {
    uuid: string;
    username: string;
    password: string;
    salt: string;
    md5: string;
    sha1: string;
    sha256: string;
  };
  dob: { date: string; age: number };
  registered: { date: string; age: number };
  phone: string;
  cell: string;
  id: { name: string; value: string };
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat: string;
}

export interface UserInterface {
  name: string;
  email: string;
  contact: string;
  username: string;
  password: string;
  location: string;
  idCard: Blob | undefined;
  token?: string;
}

export interface LoanCollateral {
  title: string;
  description: string;
}

export interface LoanRequestInterface {
  requestedAmount: number;
  paybackAmount: number;
  collateral: LoanCollateral;
  date: string;
  borrowerLocation: string;
  isCollateralExist: boolean;
  status: "saved" | "published" | "granted" | "preconfirmed" | "paid";
}
