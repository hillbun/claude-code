import curses
import random
import sys


def draw_border(win, h, w):
    win.attron(curses.color_pair(3))
    for x in range(w - 1):
        win.addch(0, x, curses.ACS_HLINE)
        win.addch(h - 1, x, curses.ACS_HLINE)
    for y in range(h):
        win.addch(y, 0, curses.ACS_VLINE)
        try:
            win.addch(y, w - 1, curses.ACS_VLINE)
        except curses.error:
            pass
    win.addch(0, 0, curses.ACS_ULCORNER)
    try:
        win.addch(0, w - 1, curses.ACS_URCORNER)
    except curses.error:
        pass
    win.addch(h - 1, 0, curses.ACS_LLCORNER)
    try:
        win.addch(h - 1, w - 1, curses.ACS_LRCORNER)
    except curses.error:
        pass
    win.attroff(curses.color_pair(3))


def place_food(snake, h, w):
    while True:
        food = (random.randint(1, h - 2), random.randint(1, w - 2))
        if food not in snake:
            return food


def show_centered(win, h, w, lines, color_pair=0):
    start_y = h // 2 - len(lines) // 2
    for i, line in enumerate(lines):
        x = max(0, w // 2 - len(line) // 2)
        if color_pair:
            win.attron(curses.color_pair(color_pair))
        win.addstr(start_y + i, x, line)
        if color_pair:
            win.attroff(curses.color_pair(color_pair))


def run_game(stdscr):
    curses.curs_set(0)
    curses.start_color()
    curses.use_default_colors()
    curses.init_pair(1, curses.COLOR_GREEN, -1)   # 蛇身
    curses.init_pair(2, curses.COLOR_RED, -1)     # 食物 / 游戏结束
    curses.init_pair(3, curses.COLOR_CYAN, -1)    # 边框
    curses.init_pair(4, curses.COLOR_YELLOW, -1)  # 分数

    sh, sw = stdscr.getmaxyx()

    # 欢迎界面
    stdscr.clear()
    show_centered(stdscr, sh, sw, [
        "╔══════════════════╗",
        "║   贪  吃  蛇     ║",
        "╚══════════════════╝",
        "",
        "方向键 / WASD  移动",
        "Q              退出",
        "",
        "按任意键开始...",
    ], color_pair=4)
    stdscr.refresh()
    stdscr.nodelay(False)
    if stdscr.getch() in (ord('q'), ord('Q')):
        return

    # 游戏区域（居中，最大 60×28）
    h = min(sh, 28)
    w = min(sw, 60)
    oy = (sh - h) // 2
    ox = (sw - w) // 2

    win = curses.newwin(h, w, oy, ox)
    win.keypad(True)
    win.nodelay(True)

    while True:
        # 初始化一局
        snake = [(h // 2, w // 2), (h // 2, w // 2 - 1), (h // 2, w // 2 - 2)]
        direction = curses.KEY_RIGHT
        food = place_food(snake, h, w)
        score = 0

        while True:
            delay = max(60, 160 - score * 6)
            win.timeout(delay)

            # 绘制
            win.clear()
            draw_border(win, h, w)

            win.attron(curses.color_pair(2) | curses.A_BOLD)
            win.addch(food[0], food[1], '★')
            win.attroff(curses.color_pair(2) | curses.A_BOLD)

            win.attron(curses.color_pair(1) | curses.A_BOLD)
            win.addch(snake[0][0], snake[0][1], '◆')
            win.attroff(curses.A_BOLD)
            for seg in snake[1:]:
                win.addch(seg[0], seg[1], '◇')
            win.attroff(curses.color_pair(1))

            win.attron(curses.color_pair(4))
            win.addstr(0, 2, f' 分数: {score} ')
            win.attroff(curses.color_pair(4))

            win.refresh()

            # 输入
            key = win.getch()
            if key in (ord('q'), ord('Q')):
                return

            if key in (curses.KEY_UP, ord('w'), ord('W')) and direction != curses.KEY_DOWN:
                direction = curses.KEY_UP
            elif key in (curses.KEY_DOWN, ord('s'), ord('S')) and direction != curses.KEY_UP:
                direction = curses.KEY_DOWN
            elif key in (curses.KEY_LEFT, ord('a'), ord('A')) and direction != curses.KEY_RIGHT:
                direction = curses.KEY_LEFT
            elif key in (curses.KEY_RIGHT, ord('d'), ord('D')) and direction != curses.KEY_LEFT:
                direction = curses.KEY_RIGHT

            # 移动蛇头
            r, c = snake[0]
            if direction == curses.KEY_UP:
                new_head = (r - 1, c)
            elif direction == curses.KEY_DOWN:
                new_head = (r + 1, c)
            elif direction == curses.KEY_LEFT:
                new_head = (r, c - 1)
            else:
                new_head = (r, c + 1)

            # 碰墙或撞自身
            if (new_head[0] <= 0 or new_head[0] >= h - 1 or
                    new_head[1] <= 0 or new_head[1] >= w - 1 or
                    new_head in snake):
                break

            snake.insert(0, new_head)
            if new_head == food:
                score += 1
                food = place_food(snake, h, w)
            else:
                snake.pop()

        # 游戏结束
        win.nodelay(False)
        show_centered(win, h, w, [
            f"  游戏结束！得分: {score}  ",
            "",
            " R 重新开始  Q 退出 ",
        ], color_pair=2)
        win.refresh()

        ch = win.getch()
        if ch in (ord('q'), ord('Q')):
            return
        # 其他键（含 R）重新开始


def main():
    try:
        curses.wrapper(run_game)
    except KeyboardInterrupt:
        pass
    print("感谢游玩！")


if __name__ == '__main__':
    main()
