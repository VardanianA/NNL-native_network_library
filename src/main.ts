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
    devices: ["desktop", "tablet"],
    logo: false,
    autoReloadInterval: 30,
    params: {
      p1: "cetfl",
      p2: "gkga",
    },
  });

  const inPage2 = new Banner({
    id: "native_network_ad_2",
    format: "inPage",
    targetSelector: "#app > p:not(:empty):nth-of-type(1)",
    insertPosition: "afterend",
    devices: ["phone"],
    logo: true,
    autoReloadInterval: 30,
    params: {
      p1: "cetfl",
      p2: "gkga",
    },
  });

  const inPageVideo = new Banner({
    id: "native_video",
    format: "inPageVideo",
    targetSelector: "#app > p:not(:empty):nth-of-type(2)",
    insertPosition: "afterend",
    devices: ["desktop", "tablet", "phone"],
    params: {
      p1: "dbclj",
      p2: "gsjj",
    },
  });

  const bottomLine = new Banner({
    id: "bottomline",
    format: "bottomline",
    targetSelector: "body",
    insertPosition: "beforeend",
    devices: ["desktop", "tablet", "phone"],
    logo: true,
    autoReloadInterval: 30,
    params: {
      p1: "cltnd",
      p2: "gknw",
    },
  });

  const scroll = new Banner({
    id: "scroll",
    format: "scroll",
    targetSelector: "#app > p:not(:empty):nth-of-type(4)",
    insertPosition: "afterend",
    devices: ["phone"],
    logo: false,
    // autoReloadInterval: 30,
    params: {
      p1: "cobbm",
      p2: "hcbe",
      // p1: "cqqzx",
      // p2: "hcbe",
    },
  });

  inPage.init();
  inPage2.init();
  inPageVideo.init();
  bottomLine.init();
  scroll.init();
};
