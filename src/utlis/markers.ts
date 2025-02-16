import { Token, User } from "@/types/types";
import NexusLogo from "@/assets/nexusLogo.png"; 

const createMarkerElement = (className: string, content: string) => {
  const el = document.createElement("div");
  el.className = className;
  el.innerHTML = content;

  // Add fixed size styling for all markers
  el.style.width = "120px";
  el.style.height = "120px";
  el.style.borderRadius = "50%"; // Make it circular
  el.style.overflow = "hidden";

  return el;
};

const createPlayerMarker = (user: User) =>
	createMarkerElement(
		"player-marker",
		`
      <div class="player-outer">
        <div class="token-gradient-border">
          <div class="player-inner">
            <img src="${user.avatarUrl}" alt="${user.name}" class="marker-image" />
          </div>
        </div>
      </div>
      `
	);

const createUserMarker = (user: User) => {
	const el = document.createElement("div");
	el.className = "user-marker";
	el.innerHTML = `
      <div class="other-user-outer">
        <div class="token-gradient-border">
          <img src="${user.avatarUrl}" alt="${user.name}" class="marker-image" />
        </div>
      </div>
    `;
	return el;
};

const createTokenMarker = (token: Token) =>
  createMarkerElement(
    "token-marker",
    `
      <div class="token-outer">
        <img src="${NexusLogo.src}" alt="${token.symbol}" class="marker-image" style="width: 100%; height: 100%;" />
      </div>
    `
  );

const createCrateMarker = () =>
	createMarkerElement(
		"crate-marker",
		`<div class="crate-outer">
      <div class="crate-gradient-border">
        <div class="crate-inner">
          <img src="/chestbg-1@2x.png" alt="crate" class="marker-image" />
        </div>
      </div>
    </div>`
	);

export {
	createUserMarker,
	createTokenMarker,
	createCrateMarker,
	createPlayerMarker,
};