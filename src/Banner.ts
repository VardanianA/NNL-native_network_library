import { ADFOX_OWNER_ID } from "./constants/adfox.constant";
import { BannerOptions } from "./types/banner.type";

export class Banner {
  public id: string;
  public format: string;
  public insertPosition: InsertPosition;
  public autoReloadInterval: number;
  public autoReloadMethod: BannerOptions["autoReloadMethod"];
  public devices: BannerOptions["devices"];
  public logo: BannerOptions["logo"];
  private params: BannerOptions["params"];
  private onClose: BannerOptions["onClose"];
  private onError: BannerOptions["onError"];
  private onLoad: BannerOptions["onLoad"];
  private onRender: BannerOptions["onRender"];
  private onStub: BannerOptions["onStub"];

  public isVisible: boolean;
  private autoReloadIntervalId: number;
  public targetElement: Element;
  public containerElement: HTMLElement;
  private hasAdTag: boolean = false;

  constructor(options: BannerOptions) {
    this.id = options.id;
    this.format = options.format;
    this.targetElement = document.querySelector(options.targetSelector);
    this.insertPosition = options.insertPosition;
    this.autoReloadInterval = options.autoReloadInterval ?? 0;
    this.autoReloadMethod = options.autoReloadMethod ?? "default";
    this.devices = options.devices ?? ["desktop", "tablet", "phone"];
    this.logo = options.logo;
    this.params = options.params;
    this.onClose = options.onClose;
    this.onError = options.onError;
    this.onLoad = options.onLoad;
    this.onRender = options.onRender;
    this.onStub = options.onStub;

    this.setupResizeObserver();
  }

  public init(): void {
    this.createContainer();
    this.createAdTag();
    this.showOrHideOnScroll();
  }

  private handleWindowResize(): void {
    const canShowForDevice = this.canShowForDevice();

    if (canShowForDevice && !this.isVisible && !this.hasAdTag) {
      this.callAdTag();
      this.showOrHideLogo();
    }

    this.isVisible = canShowForDevice;

    canShowForDevice ? this.show() : this.hide();
  }

  private setupResizeObserver(): void {
    window.addEventListener("resize", this.handleWindowResize.bind(this));
  }

  public canShowForDevice(): boolean {
    if (window.innerWidth < 600) {
      return this.devices.includes("phone");
    } else if (window.innerWidth < 1024) {
      return this.devices.includes("tablet");
    }

    return this.devices.includes("desktop");
  }

  public createAdTag(): void {
    this.containerElement.insertAdjacentHTML(
      "beforeend",
      `<div id="${this.id}"></div>`
    );
  }

  public destroyAdTag(): void {
    this.containerElement.innerHTML = "";
  }

  private show(): void {
    this.containerElement.style.display = "inherit";
  }

  private hide(): void {
    this.containerElement.style.display = "none";
  }

  public createContainer(): void {
    if (!this.targetElement) return;

    this.targetElement.insertAdjacentHTML(
      this.insertPosition,
      `<div nnl-id="nnl_${this.id}"></div>`
    );

    this.containerElement = document.querySelector(`[nnl-id="nnl_${this.id}"]`);

    this.handleWindowResize();
  }

  public callAdTag(): void {
    this.hasAdTag = true;

    window.yaContextCb.push(() => {
      window.Ya.adfoxCode.create({
        ownerId: ADFOX_OWNER_ID,
        containerId: this.id,
        params: this.params,
        onClose: this.onClose,
        onError: this.onError,
        onLoad: this.onLoad,
        onRender: this.onRender,
        onStub: this.onStub,
      });
    });

    if (this.autoReloadInterval) {
      this.setupAutoReload();
    }
  }

  private setupAutoReload(): void {
    clearInterval(this.autoReloadIntervalId);

    this.autoReloadIntervalId = setInterval(() => {
      if (!this.isVisible) return;

      if (this.autoReloadMethod === "default") this.reload();
      if (this.autoReloadMethod === "force") this.forceReload();
    }, this.autoReloadInterval * 1e3);
  }

  public reload(): void {
    window.Ya.adfoxCode.reload(this.id);
  }

  public forceReload(): void {
    this.destroyAdTag();
    this.createAdTag();
    this.callAdTag();
  }

  public showOrHideOnScroll(): void {
    const getElementVisibilityInfo = (
      element: HTMLElement
    ): {
      visiblePercentage: number;
      isTopVisible: boolean;
      isBottomVisible: boolean;
    } => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const elementTop = rect.top;
      const elementBottom = rect.bottom;
      const elementHeight = rect.height;

      const isTopVisible = elementTop >= 0 && elementTop < viewportHeight;
      const isBottomVisible =
        elementBottom >= 0 && elementBottom < viewportHeight;

      const visibleTop = Math.max(0, elementTop);
      const visibleBottom = Math.min(viewportHeight, elementBottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);

      const visiblePercentage = (visibleHeight / elementHeight) * 100;

      return {
        visiblePercentage,
        isTopVisible,
        isBottomVisible,
      };
    };

    const handleScroll = () => {
      const scrollElement = document.getElementById("scroll") as HTMLElement;

      if (!scrollElement) return;

      const { visiblePercentage, isBottomVisible } =
        getElementVisibilityInfo(scrollElement);

      if (
        visiblePercentage > 10 &&
        !(isBottomVisible && visiblePercentage < 50)
      ) {
        (
          (document.querySelector(".caramel-bottomline") as HTMLElement) || null
        ).style.display = "none";
      } else {
        (
          (document.querySelector(".caramel-bottomline") as HTMLElement) || null
        ).style.display = "unset";
      }
    };

    handleScroll();
    document.addEventListener("scroll", handleScroll);
  }

  public showOrHideLogo(): void {
    return this.logo ? this.callinPageLogo() : null;
  }

  public callinPageLogo(): void {
    setTimeout(() => {
      const inPage = document.querySelector(".inPage > div");
      // const bottomLine = document.querySelector(".caramel-bottomline");

      if (!inPage) return;

      const topLogo = document.createElement("a");

      topLogo.className = "nativeLogoTop";
      topLogo.href = "https://native.weprodigi.com/";
      topLogo.target = "_blank";
      topLogo.innerHTML =
        '<img src="https://ads.caramel.am/new_logo_svg/advertising.svg" id="top_svg_advertising">';

      inPage.appendChild(topLogo);

      const bottomLogo = document.createElement("a");

      bottomLogo.className = "nativeLogoBottom";
      bottomLogo.href = "https://native.weprodigi.com/";
      bottomLogo.target = "_blank";
      bottomLogo.innerHTML =
        '<div class="bottomBox logoAnimation" id="bottomBox"> <img src="https://ads.caramel.am/new_logo_svg/logo.svg" id="logo_svg_text" > <img src="https://ads.caramel.am/new_logo_svg/caramel.svg" id="logo_svg"> </div>';

      inPage.appendChild(bottomLogo);

      // const bottomlineLogo = document.createElement("a");
      // bottomlineLogo.className = "caramel_bottomline_logo";
      // bottomlineLogo.href = "https://native.weprodigi.com/";
      // bottomlineLogo.target = "_blank";
      // bottomlineLogo.innerHTML =
      //   '<div class="logo_bottomline bottomline_logo_animation" id="logo_bottomline"> <img src="https://ads.caramel.am/new_logo_svg/logo.svg" id="bottomline_svg_text" > <img src="https://ads.caramel.am/new_logo_svg/caramel.svg" id="bottomline_svg_logo" class="" > </div>';

      // bottomLine.appendChild(bottomlineLogo);
    }, 1000);
  }
}
