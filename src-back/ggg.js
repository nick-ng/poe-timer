import fetch from "node-fetch";

export const fetchCharacters = async ({ account, userAgent }) => {
  try {
    const res = await fetch(
      "https://www.pathofexile.com/character-window/get-characters",
      {
        credentials: "include",
        headers: {
          "User-Agent": userAgent,
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Accept-Language": "en-GB,en;q=0.5",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          Pragma: "no-cache",
          "Cache-Control": "no-cache",
        },
        referrer: `https://www.pathofexile.com/account/view-profile/${account}/characters`,
        body: `accountName=${account}&realm=pc`,
        method: "POST",
        mode: "cors",
      }
    );

    const resJson = await res.json();

    if (Array.isArray(resJson)) {
      return resJson;
    }

    if (resJson.error) {
      console.error("error", resJson.error);
    }
  } catch (e) {
    console.error("e", e);
  }

  return [];
};
