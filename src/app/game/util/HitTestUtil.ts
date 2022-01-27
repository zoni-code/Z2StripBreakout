import {
  RadiusObject,
  RectObject,
} from "../gameObject/Base";

export function isContains(rect: RectObject, px: number, py: number) {
  return rect.top < py && py < rect.bottom && rect.left < px && px < rect.right;
}

export type ConflictDirection = "top" | "right" | "bottom" | "left" | "none";

export function isBlockAndBallConflicts(
  block: RectObject,
  ball: RadiusObject,
  delta: number
): ConflictDirection {

  const isNear =
    Math.abs(block.x + block.width / 2 - ball.x) <= 100 &&
    Math.abs(block.y + block.height / 2 - ball.y) <= 100;

  if (!isNear) {
    return "none";
  }

  const nextBallPosition = ball.nextPosition(delta);

  if (
    isIntersected(
      ball.x,
      ball.y,
      nextBallPosition.x,
      nextBallPosition.y,
      block.left,
      block.top,
      block.left,
      block.bottom
    )
  ) {
    return "left";
  } else if (
    isIntersected(
      ball.x,
      ball.y,
      nextBallPosition.x,
      nextBallPosition.y,
      block.left,
      block.top,
      block.right,
      block.top
    )
  ) {
    return "top";
  } else if (
    isIntersected(
      ball.x,
      ball.y,
      nextBallPosition.x,
      nextBallPosition.y,
      block.right,
      block.top,
      block.right,
      block.bottom
    )
  ) {
    return "right";
  } else if (
    isIntersected(
      ball.x,
      ball.y,
      nextBallPosition.x,
      nextBallPosition.y,
      block.left,
      block.bottom,
      block.right,
      block.bottom
    )
  ) {
    return "bottom";
  }
  return "none";
}

function isIntersected(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  dx: number,
  dy: number
) {
  const ta = (cx - dx) * (ay - cy) + (cy - dy) * (cx - ax);
  const tb = (cx - dx) * (by - cy) + (cy - dy) * (cx - bx);
  const tc = (ax - bx) * (cy - ay) + (ay - by) * (ax - cx);
  const td = (ax - bx) * (dy - ay) + (ay - by) * (ax - dx);
  return tc * td < 0 && ta * tb < 0;
}
