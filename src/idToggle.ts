import { EditorView, WidgetType } from "@codemirror/view";
import { createPopper, Instance as PopperInstance } from "@popperjs/core";
import moment from "moment";
export class IdToggle extends WidgetType {
	private idText: string;
	private popper: PopperInstance | null;
	private div: HTMLSpanElement;
	private view: EditorView;
	private isOpen = false;
	private popUpContainer: HTMLDivElement | null;
	constructor(idText: string, from: number, view: EditorView) {
		super();
		this.idText = idText;
		this.view = view;
	}
	show = (e: any, emojiElem: HTMLSpanElement) => {
		const appContainer = document.getElementsByClassName(
			"app-container"
		)[0] as HTMLElement;
		document.getElementById("idPopup")?.remove();
		this.popUpContainer = createDiv();
		this.popUpContainer.id = "idPopup";
		this.popUpContainer.setAttribute("data-show", "true");
		this.popUpContainer.setCssStyles({
			padding: "8px",
			display: "flex",
			flexDirection: "row",
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: "var(--background-secondary-alt)",
			borderRadius: "var(--radius-m)",
			userSelect: "text",
		});
		const closeButton = createDiv();
		const textArea = createSpan();
		textArea.setText(this.idText);
		this.popUpContainer.appendChild(textArea);
		closeButton.setText("X");
		closeButton.setCssStyles({
			padding: "4px 8px",
			textAlign: "center",
			lineHeight: "1",
			marginLeft: "8px",
			backgroundColor: "var(--background-modifier-error)",
			cursor: "pointer",
			borderRadius: "4px",
		});

		closeButton.onclick = this.hide;
		this.popUpContainer.appendChild(closeButton);
		appContainer.appendChild(this.popUpContainer);
		this.popper = createPopper(emojiElem, this.popUpContainer);
		const idContainer = createDiv();
		this.popUpContainer.appendChild(idContainer);

		this.popper.update();
		this.isOpen = true;
	};

	hide = (e: any) => {
		try {
			this.popper?.update();
			this.popper?.destroy();
		} catch (err) {
			console.log(err);
		}
		this.popUpContainer?.remove();
		this.isOpen = false;
	};
	toDOM(view: EditorView): HTMLElement {
		this.div = document.createElement("span");
		this.div.className = "obs-tasks-clickable-id";
		this.div.style.cursor = "pointer";
		this.div.innerText = "🆔";
		this.div.onclick = (e) => {
			if (!this.isOpen) {
				this.show(e, this.div);
			} else {
				this.hide(e);
			}
		};

		return this.div;
	}
}
