import { RadiusObject, RectObject } from "../gameObject/Base";

export function isContains(rect: RectObject, px: number, py: number) {
  return rect.top < py && py < rect.bottom && rect.left < px && px < rect.right;
}

export type ConflictDirection = "top" | "right" | "bottom" | "left" | "none";

export function isBlockAndBallConflicts(
  rect: RectObject,
  radius: RadiusObject
): ConflictDirection {
  const nextBallX = radius.x + radius.velocity.x;
  const nextBallY = radius.y + radius.velocity.y;

  if (
    Math.abs(rect.x - nextBallX) > radius.radius * 5 &&
    Math.abs(rect.y - nextBallY) > radius.radius * 5
  ) {
    // 足切り
    return "none";
  }

  if (
    isIntersected(
      radius.x,
      radius.y,
      nextBallX,
      nextBallY,
      rect.left,
      rect.top,
      rect.left,
      rect.bottom
    )
  ) {
    return "left";
  } else if (
    isIntersected(
      radius.x,
      radius.y,
      nextBallX,
      nextBallY,
      rect.left,
      rect.top,
      rect.right,
      rect.top
    )
  ) {
    return "top";
  } else if (
    isIntersected(
      radius.x,
      radius.y,
      nextBallX,
      nextBallY,
      rect.right,
      rect.top,
      rect.right,
      rect.bottom
    )
  ) {
    return "right";
  } else if (
    isIntersected(
      radius.x,
      radius.y,
      nextBallX,
      nextBallY,
      rect.left,
      rect.bottom,
      rect.right,
      rect.bottom
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
