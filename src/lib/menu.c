#include "menu.h"

#include "cglp.h"

#define MAX_GAMES_PER_PAGE 15
#define KEY_REPEAT_DURATION 30
int gameCount = 0;
static int gameIndex = 1;
static int keyRepeatTicks = 0;

void menuUpdate() {
  color = BLUE;
  text("[A]      [B]", 3, 3);
  color = BLACK;
  text("   Select   Down", 3, 3);

  if (input.b.isPressed || input.down.isPressed || input.up.isPressed) {
    keyRepeatTicks++;
  } else {
    keyRepeatTicks = 0;
  }
  if (input.b.isJustPressed || input.down.isJustPressed ||
      (keyRepeatTicks > KEY_REPEAT_DURATION &&
       (input.b.isPressed || input.down.isPressed))) {
    gameIndex++;
    gameIndex = wrap(gameIndex, 1, gameCount);
    if (keyRepeatTicks > KEY_REPEAT_DURATION) {
      keyRepeatTicks = KEY_REPEAT_DURATION / 3 * 2;
    }
  }
  if (input.up.isJustPressed ||
      (keyRepeatTicks > KEY_REPEAT_DURATION && input.up.isPressed)) {
    gameIndex--;
    gameIndex = wrap(gameIndex, 1, gameCount);
    if (keyRepeatTicks > KEY_REPEAT_DURATION) {
      keyRepeatTicks = KEY_REPEAT_DURATION / 3 * 2;
    }
  }

  // Calculate current page and starting index
  int currentGames = 0;
  int page = 0;
  int startIndex = 1; // Start from 1 to skip first game

  // Find which page we're on and the starting index
  int tempIndex = 1; // Start from 1
  int gamesPerPage = page == 0 ? MAX_GAMES_PER_PAGE : MAX_GAMES_PER_PAGE - 1;
  while (tempIndex + gamesPerPage <= gameIndex) {
      tempIndex += gamesPerPage;
      startIndex = tempIndex;
      page++;
  }

  // Draw the games for current page
  currentGames = gamesPerPage;
  color = BLACK;
  for (int i = 0; i < currentGames; i++) {
      int gamePos = startIndex + i;
      if (gamePos >= gameCount) break;

      float y = (i + 1) * 6; // Always offset by one line

      // Draw selection cursor
      if (gamePos == gameIndex) {
          color = BLUE;
          text(">", 3, y + 3);
          color = BLACK;
      }

      // Draw game title
      // TODO: handle unterminated string
      char* name = md_gameListGetItemName(gamePos);
      if (name < 0) {
        color = RED;
        text("ERROR", 9, y + 3);
        color = BLACK;
      } else {
        text(name, 9, y + 3);
      }
  }

  if (input.a.isJustPressed) {
    restartGame(gameIndex);
  }
}

Game dummy = {.title = "test", .description = "test"};
Game getGame(int index) { return dummy; }
