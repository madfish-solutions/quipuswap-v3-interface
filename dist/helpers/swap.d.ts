import { Nat, quipuswapV3Types } from "../types";
export declare class TooBigPriceChangeErr extends Error {
}
type SwapRequiredCumulative = Pick<quipuswapV3Types.TimedCumulative, "tick">;
type SwapRequiredConstants = Pick<quipuswapV3Types.Constants, "feeBps">;
type SwapRequiredTickState = Pick<quipuswapV3Types.TickState, "prev" | "next" | "sqrtPrice" | "tickCumulativeOutside" | "liquidityNet">;
interface SwapRequiredStorage extends Pick<quipuswapV3Types.Storage, "liquidity" | "sqrtPrice" | "curTickIndex" | "curTickWitness"> {
    ticks: Record<string, SwapRequiredTickState>;
    constants: SwapRequiredConstants;
    lastCumulative: SwapRequiredCumulative;
}
export declare function calculateXToY(s: SwapRequiredStorage, dx: Nat): {
    output: Nat;
    inputLeft: Nat;
    newStoragePart: SwapRequiredStorage;
};
export declare function calculateYToX(s: SwapRequiredStorage, dy: Nat): {
    output: Nat;
    inputLeft: Nat;
    newStoragePart: SwapRequiredStorage;
};
export {};
