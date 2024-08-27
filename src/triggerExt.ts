import { type App } from "obsidian";
import {
	Decoration,
	DecorationSet,
	EditorView,
	PluginSpec,
	ViewPlugin,
	ViewUpdate,
	type PluginValue,
} from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { CalendarToggle } from "./calendarToggle";
import { Datepicker } from "vanillajs-datepicker";
import { IdToggle } from "./idToggle";

class EmojiReplacementPlugin implements PluginValue {
	private readonly view: EditorView;
	decorations: DecorationSet;
	constructor(view: EditorView) {
		this.view = view;
		this.decorations = this.buildDecorations(view);
		this.buildDecorations(view);
	}
	private findEmoji(text: string) {
		// Define a regular expression to match emojis
		const emojiRegex = /[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/gu;
		let result = [];
		let match;

		// Iterate over all matches in the text
		while ((match = emojiRegex.exec(text)) !== null) {
			result.push({
				emoji: match[0],
				start: match.index,
				end: match.index + match[0].length,
			});
		}

		return result as {
			emoji: string;
			start: number;
			end: number;
		}[];
	}
	update(update: ViewUpdate) {
		if (update.docChanged || update.viewportChanged) {
			this.decorations = this.buildDecorations(update.view);
		}
	}

	destroy() {}
	// Example usage

	buildDecorations(view: EditorView): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();
		for (let { from, to } of view.visibleRanges) {
			syntaxTree(view.state).iterate({
				from,
				to,
				enter: (node) => {
					if (node.type.name.startsWith("list")) {
						const text = view.state.sliceDoc(node.from, node.to);
						view.state.update();
						const emojiList = this.findEmoji(text);
						const tasksEmojiList = ["📅", "🛫", "⏳", "✅"];
						emojiList.map((emojiObj) => {
							if (tasksEmojiList.contains(emojiObj.emoji)) {
								const beforeDateParse = text.slice(
									emojiObj.end
								);
								const regex = /(\d{4}-\d{2}-\d{2})/u;
								console.log(node.from);
								builder.add(
									node.from + emojiObj.start,
									node.from + emojiObj.end,
									Decoration.replace({
										widget: new CalendarToggle(
											emojiObj.emoji,
											regex.exec(beforeDateParse),
											node.from + emojiObj.end,
											view
										),
									})
								);
							}
							if (emojiObj.emoji === "🆔") {
								const idText = text.slice(emojiObj.end);
								const regex = /([0-z]+)(?!\S)/u;
								const idRegex = regex.exec(idText);
								console.log(idRegex);
								if (idRegex !== null) {
									console.log(
										node.from +
											emojiObj.end +
											idRegex.index +
											idRegex[0].length
									);
									builder.add(
										node.from + emojiObj.start,
										node.from +
											emojiObj.end +
											idRegex.index +
											idRegex[0].length,
										Decoration.replace({
											widget: new IdToggle(
												idRegex[0],
												node.from + emojiObj.end,
												view
											),
										})
									);
								}
							}
						});

						// Position of the '-' or the '*'.
						// builder.add(
						//   listCharFrom,
						//   listCharFrom + 1,
						//   Decoration.replace({
						//     widget: new (),
						//   })
						// );
					}
				},
			});
		}

		return builder.finish();
	}
}

const pluginSpec: PluginSpec<EmojiReplacementPlugin> = {
	decorations: (value: EmojiReplacementPlugin) => value.decorations,
};

export const emojiReplacementPlugin = ViewPlugin.fromClass(
	EmojiReplacementPlugin,
	pluginSpec
);
