import Image from "next/image";
import { FunctionComponent, CSSProperties } from "react";

export type ThemeButtonProps = {
	className?: string;
	text?: string;
	tablerIconBrandX?: string;

	/** Variant props */
	btn?: "large";

	/** Style props */
	defaultFlex?: CSSProperties["flex"];
	defaultHeight?: CSSProperties["height"];
	defaultPadding?: CSSProperties["padding"];
	defaultGap?: CSSProperties["gap"];
	tablerIconBrandXHeight?: CSSProperties["height"];
	tablerIconBrandXWidth?: CSSProperties["width"];
	brandLabelHeight?: CSSProperties["height"];
	brandLabelDisplay?: CSSProperties["display"];
	brandLabelFontSize?: CSSProperties["fontSize"];
	brandLabelWidth?: CSSProperties["width"];
};

const ThemeButton: FunctionComponent<ThemeButtonProps> = ({
	className = "",
	btn = "large",
	text = "Connect X",
	tablerIconBrandX,
	defaultFlex,
	defaultHeight,
	defaultPadding,
	defaultGap,
	tablerIconBrandXHeight,
	tablerIconBrandXWidth,
	brandLabelHeight,
	brandLabelDisplay,
	brandLabelFontSize,
	brandLabelWidth,
}) => {
	return (
		<div
			className={`flex-1 shadow-[0px_-2px_4px_rgba(0,_0,_0,_0.3)_inset,_0px_4px_2px_rgba(255,_255,_255,_0.3)_inset] 
                        rounded-81xl bg-primary border-purple-400 border-[1px] border-solid 
                        h-[2.5rem] overflow-hidden flex items-center justify-center 
                        py-[0.5rem] px-[1rem] gap-[0.125rem] text-left text-[1rem] 
                        text-highlight   ${className}`}
			data-btn={btn}
			style={{
				flex: defaultFlex,
				height: defaultHeight,
				padding: defaultPadding,
				gap: defaultGap,
			}}
		>
			{tablerIconBrandX && (
				<Image
					src={tablerIconBrandX}
					alt="alt"
					width={1000}
					height={1000}
					className="h-[1.5rem] w-[1.5rem] relative overflow-hidden shrink-0"
					loading="lazy"
					style={{
						height: tablerIconBrandXHeight,
						width: tablerIconBrandXWidth,
					}}
				/>
			)}
			<div
				className="relative"
				style={{
					height: brandLabelHeight,
					display: brandLabelDisplay,
					fontSize: brandLabelFontSize,
					width: brandLabelWidth,
				}}
			>
				{text}
			</div>
		</div>
	);
};

export default ThemeButton;
