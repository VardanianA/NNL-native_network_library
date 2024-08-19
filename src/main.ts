import { Banner } from "./Banner";
import "./style.css";

const yandexScript = document.createElement("script");
yandexScript.src = "https://yandex.ru/ads/system/context.js";
yandexScript.async = true;
document.head.appendChild(yandexScript);

yandexScript.onload = () => {
  const inPage = new Banner({
    id: "native_network_ad_1",
    format: "inPage",
    targetSelector: "#app > p:not(:empty):nth-of-type(1)",
    insertPosition: "afterend",
    autoReloadInterval: 30,
    params: {
      p1: "cetfl",
      p2: "gkga",
    },
  });

  inPage.init();
};
