import { EditorView, WidgetType } from "@codemirror/view";
import { createPopper, Instance as PopperInstance } from "@popperjs/core";
import moment from "moment";
import Datepicker from "vanillajs-datepicker/Datepicker";
export class CalendarToggle extends WidgetType {
	private emoji: string;
	private popper: PopperInstance | null;
	private div: HTMLSpanElement;
	private date?: moment.Moment;
	private datePicker: Datepicker | null;
	private view: EditorView;
	private isOpen = false;
	private updateLocation: {
		start: number;
		end: number;
	} = { start: 0, end: 0 };
	private popUpContainer: HTMLDivElement | null;
	constructor(
		emoji: string,
		dateParsingText: RegExpExecArray | null,
		from: number,
		view: EditorView
	) {
		super();
		this.emoji = emoji;
		this.view = view;
		this.date = moment(dateParsingText?.[0], "YYYY-MM-DD");
		if (this.date.isValid()) {
			this.updateLocation.start = from + dateParsingText!.index;
			this.updateLocation.end = this.updateLocation.start + 10;
		}
	}
	show = (e: any, emojiElem: HTMLSpanElement) => {
		const appContainer = document.getElementsByClassName(
			"app-container"
		)[0] as HTMLElement;
		document.getElementById("calPopupContainer")?.remove();
		this.popUpContainer = createDiv();
		this.popUpContainer.id = "calPopupContainer";
		this.popUpContainer.setAttribute("data-show", "true");
		appContainer.appendChild(this.popUpContainer);
		this.popper = createPopper(emojiElem, this.popUpContainer);
		this.datePicker = new Datepicker(this.popUpContainer, {
			defaultViewDate: this.date?.toDate(),
		});
		const closeButton = createDiv();
		closeButton.setText("X");
		closeButton.setCssStyles({
			position: "absolute",
			bottom: "4px",
			right: "8px",
			margin: "2px 2px",
			padding: "9px 13px",
			backgroundColor: "var(--background-modifier-error)",
			cursor: "pointer",
			borderRadius: "4px",
		});

		closeButton.onclick = this.hide;
		this.popUpContainer.appendChild(closeButton);

		this.popper.update();
		this.popUpContainer.addEventListener("changeDate", (e: CustomEvent) => {
			const transaction = this.view.state.update({
				changes: {
					from: this.updateLocation.start,
					to: this.updateLocation.end,
					insert: moment(e.detail.date).format("YYYY-MM-DD"),
				},
				selection: { anchor: 0 + this.updateLocation.end },
			});
			this.view.dispatch(transaction);
			this.hide(e);
		});
		this.isOpen = true;
	};

	hide = (e: any) => {
		try {
			this.popper?.update();
			this.datePicker?.destroy();
			this.popper?.destroy();
		} catch (err) {
			console.log(err);
		}
		this.popUpContainer?.remove();
		this.isOpen = false;
	};
	toDOM(view: EditorView): HTMLElement {
		this.div = document.createElement("span");
		this.div.className = "obs-tasks-clickable-date";
		this.div.style.cursor = "pointer";
		this.div.innerText = this.emoji;
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
