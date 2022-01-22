export type ModalOption = {
  title: string;
  downloadLink?: {
    label: string;
    url: string;
  };
  primaryButton?: {
    label: string;
    onClick: () => void;
  };
};

export class Modal {
  constructor(private modalContainer: HTMLElement) {}

  public show(modalOption: ModalOption) {
    this.dispose();
    this.modalContainer.appendChild(this.createModal(modalOption));
  }

  public hide() {
    this.dispose();
  }

  private dispose() {
    this.modalContainer.innerHTML = "";
  }

  private createModal(modalOption: ModalOption) {
    const modal = document.createElement("div");
    modal.classList.add("stbo-modal");
    const title = document.createElement("div");
    title.classList.add("stbo-modal-title");
    title.textContent = modalOption.title;
    modal.appendChild(title);
    if (modalOption.downloadLink) {
      const link = document.createElement("a");
      link.classList.add("stbo-modal-download-link");
      link.href = modalOption.downloadLink.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.download = "download";
      link.textContent = modalOption.downloadLink.label;
      modal.appendChild(link);
    }
    if (modalOption.primaryButton) {
      const button = document.createElement("button");
      button.type = "button";
      button.classList.add("stbo-modal-button");
      button.textContent = modalOption.primaryButton.label;
      button.addEventListener("click", () => {
        modalOption.primaryButton?.onClick();
        this.hide();
      });
      modal.appendChild(button);
    }
    return modal;
  }
}
