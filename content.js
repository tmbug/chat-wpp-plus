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
			<button class="chatwppplus-width-btn chatwppplus-mr">set width</button>
			<button class="chatwppplus-zen-btn chatwppplus-mr">zen ${
				zenMode === "on" ? "🟢" : "🔴"
			}</button>
			<button class="chatwppplus-code-collapse-btn" aria-label="collapse long codeblocks for easier scrolling through the chat">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-fold-vertical-icon lucide-fold-vertical"><path d="M12 22v-6"/><path d="M12 8V2"/><path d="M4 12H2"/><path d="M10 12H8"/><path d="M16 12h-2"/><path d="M22 12h-2"/><path d="m15 19-3-3-3 3"/><path d="m15 5-3 3-3-3"/></svg>
			</button>
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
		const codeCollapseBtn = getTargetElement().querySelector(".chatwppplus-code-collapse-btn");

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

		const codeCollapseStylesText = `
			pre {
				max-height: 550px;
				&::-webkit-scrollbar{
					width: 10px;
				}
			}
		`
		const codeCollapseStyles = document.createElement("style")
		codeCollapseStyles.textContent = codeCollapseStylesText

		codeCollapseBtn.addEventListener("click", () => {
			const codeCollapseActiveClass = "chatwppplus-code-collapse-btn-active"

			if(codeCollapseBtn.classList.contains(codeCollapseActiveClass)){
				codeCollapseBtn.classList.remove(codeCollapseActiveClass)
				document.head.removeChild(codeCollapseStyles)
			}else {
				codeCollapseBtn.classList.add(codeCollapseActiveClass)
				document.head.appendChild(codeCollapseStyles)
			}
		})
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
			if(block.querySelector("span.chatwppplus-iamalreadyhighlighted")) {
				return;
			}else {
				hljs.highlightElement(block);
				const span = document.createElement("span");
				span.className = "chatwppplus-iamalreadyhighlighted";
				block.append(span);
			}
		});
	}, 3000);
}
