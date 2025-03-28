(function () {
	"use strict";

	chatWidthAndZenSetter();
	copyCodeButtons();
	highlight();
})();

function injectStyles(styleText) {
	const styleElement = document.createElement("style");
	styleElement.textContent = styleText;
	document.head.appendChild(styleElement);
}

function chatWidthAndZenSetter() {
	const html = (width, zenMode) =>
		`
		<div class="chatwppplus-width-setter">
			<input type="number" step="50" placeholder="width" min="200" value="${width}">
			<button class="chatwppplus-width-btn">set width</button>
			<button class="chatwppplus-zen-btn">zen ${
				zenMode === "on" ? "🟢" : "🔴"
			}</button>
		</div>

		<style>
			.conversation-layout .chat-messages-container .chat-messages {
				max-width: ${width}px;
			}

			.chat-message .chat-message__content-wrapper {
				max-width: 100%;
			} 
		</style>
	`;

	const getTargetElement = () =>
		document.querySelector(
			".main-content .basic-header .basic-header-actions"
		);

	const observer = new MutationObserver(() => {
		if (getTargetElement()) {
			injectHtmlAndDoSetup();
			observer.disconnect();
		}
	});

	observer.observe(document.body, { childList: true, subtree: true });

	function injectHtmlAndDoSetup() {
		const ls = (() => {
			const keys = {
				width: "chatwppplus-chat-width",
				zen: "chatwppplus-chat-zenmode",
			};

			return {
				getWidth: () => localStorage.getItem(keys.width) || 700,
				setWidth: (value) => localStorage.setItem(keys.width, value),
				getZen: () => localStorage.getItem(keys.zen) || "off",
				setZen: (value) => localStorage.setItem(keys.zen, value),
			};
		})();

		getTargetElement().insertAdjacentHTML(
			"beforeend",
			html(ls.getWidth(), ls.getZen())
		);

		const chatwppplusZenStylesClass = "chatwppplus-zen-styles"

		if (ls.getZen() === "on") {
			document.body.classList.add(chatwppplusZenStylesClass)
		}

		const widthInput = getTargetElement().querySelector(
			".chatwppplus-width-setter > input"
		);
		const widthSetBtn = getTargetElement().querySelector(
			".chatwppplus-width-setter > .chatwppplus-width-btn"
		);
		const zenBtn = getTargetElement().querySelector(
			".chatwppplus-width-setter > .chatwppplus-zen-btn"
		);

		widthSetBtn.addEventListener("click", () => {
			document.querySelector(
				".conversation-layout .chat-messages-container .chat-messages"
			).style.maxWidth = `${widthInput.value}px`;
			ls.setWidth(widthInput.value);
		});

		zenBtn.addEventListener("click", () => {
			if (ls.getZen() === "on") {
				ls.setZen("off");
				document.body.classList.remove(chatwppplusZenStylesClass)
				zenBtn.innerText = "zen 🔴";
			} else {
				ls.setZen("on");
				document.body.classList.add(chatwppplusZenStylesClass)
				zenBtn.innerText = "zen 🟢";
			}
		});
	}
}

function copyCodeButtons() {
	const styles = `
		pre {
			position: relative;
			padding-top: 40px !important;
			background: rgb(13, 17, 23);
			color: var(--chatwppplus-neutral-100);
			border-radius: 6px;
		}
	`;
	injectStyles(styles);

	setInterval(() => {
		Array.from(
			document.querySelectorAll(".markdown.message-container > pre")
		)
			.filter(
				(preElem) =>
					!preElem.querySelector("button.chatwppplus-copy-btn")
			)
			.forEach((preElem) => {
				const copyButton = document.createElement("button");
				copyButton.className = "chatwppplus-copy-btn";
				copyButton.innerText = "copy";
				preElem.insertBefore(copyButton, preElem.firstChild);

				copyButton.addEventListener("click", async () => {
					try {
						await navigator.clipboard.writeText(
							preElem.querySelector("code").innerText
						);
						copyButton.innerText = "copied";
						setTimeout(() => (copyButton.innerText = "copy"), 1000);
					} catch (err) {
						console.error("Failed to copy: ", err);
					}
				});
			});
	}, 2000);
}

function highlight() {
	setInterval(() => {
		document.querySelectorAll("pre > code").forEach((block) => {
			hljs.highlightElement(block);
		});
	}, 3000);
}
