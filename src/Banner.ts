import { ADFOX_OWNER_ID } from "./constants/adfox.constant";
import { BannerOptions } from "./types/banner.type";

export class Banner {
  public id: string;
  public format: string;
  public insertPosition: InsertPosition;
  public autoReloadInterval: number;
  public autoReloadMethod: BannerOptions["autoReloadMethod"];
  public devices: BannerOptions["devices"];
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
    setTimeout(() => {
      const scroll = document.querySelector(
        ".interscroller"
      ) as HTMLElement | null;
      const bottomline = document.querySelector(
        ".caramel-bottomline"
      ) as HTMLElement | null;

      if (!scroll || !bottomline) return;

      const getVisiblePercentageFromBottom = (
        element: HTMLElement,
        percentageFromBottom: number
      ): number => {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate the height that must be visible from the bottom
        const requiredVisibleHeightFromBottom =
          rect.height * (percentageFromBottom / 100);

        // Calculate the visible height of the element from the bottom
        const visibleHeightFromBottom = Math.max(
          0,
          Math.min(rect.bottom, windowHeight) -
            Math.max(rect.top, windowHeight - rect.height)
        );

        // Calculate the percentage of visibility from the bottom
        const visiblePercentage = Math.min(
          (visibleHeightFromBottom / requiredVisibleHeightFromBottom) * 100,
          100
        );

        return visiblePercentage;
      };

      const getVisiblePercentageFromTop = (element: HTMLElement): number => {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        const visibleHeightTop = Math.max(
          0,
          Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0)
        );

        const visibleWidth = Math.max(
          0,
          Math.min(rect.right, windowWidth) - Math.max(rect.left, 0)
        );

        const totalHeight = rect.height;
        const requiredVisibleHeightTop = totalHeight * 0.1; // 10% from the top
        const requiredVisibleHeightBottom = totalHeight * 0.5; // 50% from the bottom

        const actualVisibleHeightTop = Math.max(
          0,
          Math.min(visibleHeightTop, requiredVisibleHeightTop)
        );

        const actualVisibleHeightBottom = Math.max(
          0,
          Math.min(
            totalHeight - (rect.bottom - windowHeight),
            requiredVisibleHeightBottom
          )
        );

        const totalVisibleHeight = Math.min(
          actualVisibleHeightTop + actualVisibleHeightBottom,
          totalHeight
        );

        const visibleArea = visibleWidth * totalVisibleHeight;
        const totalArea = rect.width * rect.height;

        if (totalArea === 0) {
          return 0;
        }

        const percentage = (visibleArea / totalArea) * 100;

        return percentage;
      };

      const updateBottomlineVisibility = (): void => {
        const percentageFromBottom = getVisiblePercentageFromBottom(scroll, 50); // Check for 50% visibility from the bottom
        const percentageFromTop = getVisiblePercentageFromTop(scroll);

        if (percentageFromBottom >= 50) {
          bottomline.style.display = "none";
        } else if (percentageFromTop == 10) {
          bottomline.style.display = "none";
        } else {
          bottomline.style.display = "inherit";
        }
      };

      // Initial check
      updateBottomlineVisibility();
      window.addEventListener("scroll", updateBottomlineVisibility);
    }, 2000);
  }
}
