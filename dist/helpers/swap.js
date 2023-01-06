"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateYToX = exports.calculateXToY = exports.TooBigPriceChangeErr = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const types_1 = require("../types");
const math_1 = require("./math");
class TooBigPriceChangeErr extends Error {
}
exports.TooBigPriceChangeErr = TooBigPriceChangeErr;
const HUNDRED_PERCENT_BPS = 10000;
function floorLogHalfBps(x, y, outOfBoundsError) {
    const tenx = x.multipliedBy(10);
    if (tenx.isLessThan(y.multipliedBy(7)) || tenx.isGreaterThan(y.multipliedBy(15))) {
        throw outOfBoundsError;
    }
    const xPlusY = x.plus(y);
    const num = x.toBignumber().minus(y).multipliedBy(60003).multipliedBy(xPlusY);
    const denom = xPlusY.multipliedBy(xPlusY).plus(x.multipliedBy(2).multipliedBy(y));
    return num.dividedToIntegerBy(denom);
}
function fixCurTickIndexRec(curTickIndexNew, curIndexSqrtPrice, sqrtPriceNew) {
    if (sqrtPriceNew.isLessThan(curIndexSqrtPrice)) {
        const prevTickIndex = curTickIndexNew.minus(1);
        const prevIndexSqrtPrice = (0, math_1.sqrtPriceForTick)(prevTickIndex);
        return fixCurTickIndexRec(prevTickIndex, prevIndexSqrtPrice, sqrtPriceNew);
    }
    else {
        const nextTickIndex = curTickIndexNew.plus(1);
        const nextIndexSqrtPrice = (0, math_1.sqrtPriceForTick)(nextTickIndex);
        if (nextIndexSqrtPrice.isLessThanOrEqualTo(sqrtPriceNew)) {
            return fixCurTickIndexRec(nextTickIndex, nextIndexSqrtPrice, sqrtPriceNew);
        }
        else {
            return curTickIndexNew;
        }
    }
}
function fixCurTickIndex(curTickIndex, sqrtPriceNew) {
    return fixCurTickIndexRec(curTickIndex, (0, math_1.sqrtPriceForTick)(curTickIndex), sqrtPriceNew);
}
function calcNewCurTickIndex(curTickIndex, sqrtPriceOld, sqrtPriceNew) {
    const curTickIndexDelta = floorLogHalfBps(sqrtPriceNew, sqrtPriceOld, new TooBigPriceChangeErr());
    const curTickIndexNew = curTickIndex.plus(curTickIndexDelta);
    return fixCurTickIndex(curTickIndexNew, sqrtPriceNew);
}
function oneMinusFeeBps(feeBps) {
    return new types_1.Nat(HUNDRED_PERCENT_BPS).minus(feeBps);
}
function xToYRec(p) {
    if (p.s.liquidity.isZero()) {
        return p;
    }
    // TODO: change fees logic after new Quipuswap V3 contracts are deployed
    let fee = (0, math_1.calcSwapFee)(p.s.constants.feeBps.toBignumber(), p.dx.toBignumber());
    let sqrtPriceNew = (0, math_1.calcNewPriceX)(p.s.sqrtPrice, p.s.liquidity, p.dx.minus(fee));
    const curTickIndexNew = calcNewCurTickIndex(p.s.curTickIndex, p.s.sqrtPrice, sqrtPriceNew);
    if (curTickIndexNew.gte(p.s.curTickWitness)) {
        const dy = (0, math_1.shiftRight)(p.s.sqrtPrice.toBignumber().minus(sqrtPriceNew).multipliedBy(p.s.liquidity), new bignumber_js_1.default(80)).integerValue(bignumber_js_1.default.ROUND_FLOOR);
        const newStorage = Object.assign(Object.assign({}, p.s), { sqrtPrice: sqrtPriceNew, curTickIndex: curTickIndexNew });
        return {
            s: newStorage,
            dx: new types_1.Nat(0),
            dy: p.dy.plus(dy)
        };
    }
    const tick = p.s.ticks[p.s.curTickWitness.toFixed()];
    const loNew = tick.prev;
    sqrtPriceNew = new types_1.quipuswapV3Types.x80n(tick.sqrtPrice.minus(1));
    const dy = (0, math_1.shiftRight)(p.s.sqrtPrice.toBignumber().minus(sqrtPriceNew).multipliedBy(p.s.liquidity), new bignumber_js_1.default(80)).integerValue(bignumber_js_1.default.ROUND_FLOOR);
    const dxForDy = (0, math_1.shiftLeft)(dy, new bignumber_js_1.default(160))
        .dividedBy(p.s.sqrtPrice.multipliedBy(sqrtPriceNew))
        .integerValue(bignumber_js_1.default.ROUND_CEIL);
    const dxConsumed = dxForDy
        .multipliedBy(HUNDRED_PERCENT_BPS)
        .dividedBy(oneMinusFeeBps(p.s.constants.feeBps))
        .integerValue(bignumber_js_1.default.ROUND_CEIL);
    fee = dxConsumed.minus(dxForDy);
    const sums = p.s.lastCumulative;
    const tickCumulativeOutsideNew = sums.tick.sum.minus(tick.tickCumulativeOutside);
    const tickNew = Object.assign(Object.assign({}, tick), { tickCumulativeOutside: tickCumulativeOutsideNew });
    const ticksNew = Object.assign(Object.assign({}, p.s.ticks), { [p.s.curTickWitness.toFixed()]: tickNew });
    const storageNew = Object.assign(Object.assign({}, p.s), { curTickWitness: loNew, sqrtPrice: sqrtPriceNew, curTickIndex: curTickIndexNew.minus(1), ticks: ticksNew, liquidity: p.s.liquidity.minus(tick.liquidityNet) });
    const paramNew = {
        s: storageNew,
        dx: p.dx.minus(dxConsumed),
        dy: p.dy.plus(dy)
    };
    return xToYRec(paramNew);
}
function calculateXToY(s, dx) {
    const r = xToYRec({ s, dx, dy: new types_1.Nat(0) });
    return {
        output: r.dy,
        inputLeft: r.dx,
        newStoragePart: r.s
    };
}
exports.calculateXToY = calculateXToY;
function yToXRec(p) {
    if (p.s.liquidity.isZero()) {
        return p;
    }
    // TODO: change fees logic after new Quipuswap V3 contracts are deployed
    let fee = (0, math_1.calcSwapFee)(p.s.constants.feeBps.toBignumber(), p.dy.toBignumber());
    let dyMinusFee = p.dy.minus(fee);
    let sqrtPriceNew = (0, math_1.calcNewPriceY)(p.s.sqrtPrice, p.s.liquidity, dyMinusFee);
    const curTickIndexNew = calcNewCurTickIndex(p.s.curTickIndex, p.s.sqrtPrice, sqrtPriceNew);
    const tick = p.s.ticks[p.s.curTickWitness.toFixed()];
    const nextTickIndex = tick.next;
    if (curTickIndexNew.lt(nextTickIndex)) {
        const dx = p.s.liquidity
            .toBignumber()
            .multipliedBy((0, math_1.shiftLeft)(sqrtPriceNew.toBignumber().minus(p.s.sqrtPrice), new bignumber_js_1.default(80)))
            .dividedBy(sqrtPriceNew.multipliedBy(p.s.sqrtPrice))
            .integerValue(bignumber_js_1.default.ROUND_FLOOR);
        const sNew = Object.assign(Object.assign({}, p.s), { sqrtPrice: new types_1.quipuswapV3Types.x80n(sqrtPriceNew), curTickIndex: curTickIndexNew });
        return { s: sNew, dy: new types_1.Nat(0), dx: p.dx.plus(dx) };
    }
    const nextTick = p.s.ticks[nextTickIndex.toFixed()];
    sqrtPriceNew = nextTick.sqrtPrice;
    const dx = new types_1.Nat(p.s.liquidity
        .toBignumber()
        .multipliedBy((0, math_1.shiftLeft)(sqrtPriceNew.toBignumber().minus(p.s.sqrtPrice), new bignumber_js_1.default(80)))
        .dividedBy(sqrtPriceNew.multipliedBy(p.s.sqrtPrice))
        .integerValue(bignumber_js_1.default.ROUND_FLOOR));
    const _280 = new bignumber_js_1.default(2).pow(80);
    const dyForDx = new types_1.Nat(p.s.liquidity
        .toBignumber()
        .multipliedBy(sqrtPriceNew.toBignumber().minus(p.s.sqrtPrice))
        .dividedBy(_280)
        .integerValue(bignumber_js_1.default.ROUND_CEIL));
    dyMinusFee = dyForDx;
    const dyConsumed = dyMinusFee
        .toBignumber()
        .multipliedBy(HUNDRED_PERCENT_BPS)
        .dividedBy(oneMinusFeeBps(p.s.constants.feeBps))
        .integerValue(bignumber_js_1.default.ROUND_CEIL);
    fee = dyConsumed.minus(dyMinusFee);
    const sums = p.s.lastCumulative;
    const tickCumulativeOutsideNew = sums.tick.sum.minus(nextTick.tickCumulativeOutside);
    const nextTickNew = Object.assign(Object.assign({}, nextTick), { tickCumulativeOutside: tickCumulativeOutsideNew });
    const ticksNew = Object.assign(Object.assign({}, p.s.ticks), { [nextTickIndex.toFixed()]: nextTickNew });
    const storageNew = Object.assign(Object.assign({}, p.s), { sqrtPrice: new types_1.quipuswapV3Types.x80n(sqrtPriceNew), curTickWitness: nextTickIndex, curTickIndex: nextTickIndex, ticks: ticksNew, liquidity: new types_1.Nat(p.s.liquidity.plus(nextTick.liquidityNet)) });
    const paramNew = {
        s: storageNew,
        dy: p.dy.minus(dyConsumed),
        dx: p.dx.plus(dx)
    };
    return yToXRec(paramNew);
}
function calculateYToX(s, dy) {
    const r = yToXRec({ s, dy, dx: new types_1.Nat(0) });
    return {
        output: r.dx,
        inputLeft: r.dy,
        newStoragePart: r.s
    };
}
exports.calculateYToX = calculateYToX;
