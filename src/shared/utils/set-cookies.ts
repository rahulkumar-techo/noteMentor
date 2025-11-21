import { CookieOptions, Response } from "express";

interface ICookie {
  res: Response;
  accessToken: string;
  refreshToken: string;
  accessTTL: number;    // in seconds
  refreshTTL: number;   // in seconds
}

const setTokenCookies = ({
  res,
  accessToken,
  refreshToken,
  accessTTL,
  refreshTTL,
}: ICookie): void => {

  const isProd = process.env.NODE_ENV === "production";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
  domain: isProd ? "onrender.com" : undefined,
  partitioned: true as any   
};




  const accessExpires = new Date(Date.now() + accessTTL * 1000);
  const refreshExpires = new Date(Date.now() + refreshTTL * 1000);
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: accessTTL * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: refreshTTL * 1000,
  });

};

export default setTokenCookies;
