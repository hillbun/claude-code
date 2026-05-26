import pygame
import random
import sys

pygame.init()

# Constants
SCREEN_WIDTH = 400
SCREEN_HEIGHT = 700
BOARD_WIDTH = 10
BOARD_HEIGHT = 20
CELL_SIZE = 30
BOARD_X = 50
BOARD_Y = 50

FPS = 60
INITIAL_FALL_SPEED = 500  # ms per row

COLORS = {
    "bg": (15, 15, 25),
    "board_bg": (25, 25, 40),
    "grid": (40, 40, 60),
    "text": (220, 220, 230),
    "text_dim": (120, 120, 140),
    "border": (80, 80, 120),
    "I": (0, 220, 220),
    "O": (220, 220, 0),
    "T": (180, 0, 220),
    "S": (0, 220, 0),
    "Z": (220, 0, 0),
    "J": (0, 80, 220),
    "L": (220, 140, 0),
    "ghost": (60, 60, 80),
}

TETROMINOES = {
    "I": [
        [[1, 1, 1, 1]],
        [[1], [1], [1], [1]],
    ],
    "O": [
        [[1, 1], [1, 1]],
    ],
    "T": [
        [[0, 1, 0], [1, 1, 1]],
        [[1, 0], [1, 1], [1, 0]],
        [[1, 1, 1], [0, 1, 0]],
        [[0, 1], [1, 1], [0, 1]],
    ],
    "S": [
        [[0, 1, 1], [1, 1, 0]],
        [[1, 0], [1, 1], [0, 1]],
    ],
    "Z": [
        [[1, 1, 0], [0, 1, 1]],
        [[0, 1], [1, 1], [1, 0]],
    ],
    "J": [
        [[1, 0, 0], [1, 1, 1]],
        [[1, 1], [1, 0], [1, 0]],
        [[1, 1, 1], [0, 0, 1]],
        [[0, 1], [0, 1], [1, 1]],
    ],
    "L": [
        [[0, 0, 1], [1, 1, 1]],
        [[1, 0], [1, 0], [1, 1]],
        [[1, 1, 1], [1, 0, 0]],
        [[1, 1], [0, 1], [0, 1]],
    ],
}

PIECE_NAMES = list(TETROMINOES.keys())


class Piece:
    def __init__(self, name=None):
        self.name = name or random.choice(PIECE_NAMES)
        self.rotations = TETROMINOES[self.name]
        self.rotation = 0
        self.shape = self.rotations[self.rotation]
        self.color = COLORS[self.name]
        self.x = BOARD_WIDTH // 2 - len(self.shape[0]) // 2
        self.y = 0

    def rotate(self, direction=1):
        self.rotation = (self.rotation + direction) % len(self.rotations)
        self.shape = self.rotations[self.rotation]

    def get_blocks(self, x=None, y=None):
        x = self.x if x is None else x
        y = self.y if y is None else y
        return [
            (x + col, y + row)
            for row, line in enumerate(self.shape)
            for col, cell in enumerate(line)
            if cell
        ]


class Board:
    def __init__(self):
        self.grid = [[None] * BOARD_WIDTH for _ in range(BOARD_HEIGHT)]

    def is_valid(self, piece, dx=0, dy=0, shape=None):
        shape = shape or piece.shape
        for col, row in [
            (piece.x + dx + c, piece.y + dy + r)
            for r, line in enumerate(shape)
            for c, cell in enumerate(line)
            if cell
        ]:
            if col < 0 or col >= BOARD_WIDTH or row >= BOARD_HEIGHT:
                return False
            if row >= 0 and self.grid[row][col]:
                return False
        return True

    def lock(self, piece):
        for col, row in piece.get_blocks():
            if 0 <= row < BOARD_HEIGHT:
                self.grid[row][col] = piece.color

    def clear_lines(self):
        full = [i for i, row in enumerate(self.grid) if all(row)]
        for i in full:
            del self.grid[i]
            self.grid.insert(0, [None] * BOARD_WIDTH)
        return len(full)

    def is_game_over(self):
        return any(self.grid[0])

    def ghost_y(self, piece):
        dy = 0
        while self.is_valid(piece, dy=dy + 1):
            dy += 1
        return piece.y + dy


class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("俄罗斯方块")
        self.clock = pygame.time.Clock()
        self.font_large = pygame.font.SysFont("microsoftyahei", 28, bold=True)
        self.font_med = pygame.font.SysFont("microsoftyahei", 20)
        self.font_small = pygame.font.SysFont("microsoftyahei", 16)
        self.reset()

    def reset(self):
        self.board = Board()
        self.score = 0
        self.lines = 0
        self.level = 1
        self.bag = []
        self.current = self._next_piece()
        self.next = self._next_piece()
        self.held = None
        self.can_hold = True
        self.game_over = False
        self.paused = False
        self.fall_timer = 0
        self.fall_speed = INITIAL_FALL_SPEED
        self.lock_timer = 0
        self.lock_delay = 500
        self.das_timer = 0
        self.das_delay = 150
        self.arr_timer = 0
        self.arr_delay = 50
        self.move_dir = 0

    def _next_piece(self):
        if not self.bag:
            self.bag = PIECE_NAMES[:]
            random.shuffle(self.bag)
        return Piece(self.bag.pop())

    def _spawn(self):
        self.current = self.next
        self.next = self._next_piece()
        self.can_hold = True
        if not self.board.is_valid(self.current):
            self.game_over = True

    def hold(self):
        if not self.can_hold:
            return
        self.can_hold = False
        if self.held:
            self.held, self.current = Piece(self.current.name), Piece(self.held.name)
        else:
            self.held = Piece(self.current.name)
            self._spawn()
            self.current = self.current  # already set in _spawn

    def _move(self, dx):
        if self.board.is_valid(self.current, dx=dx):
            self.current.x += dx
            self.lock_timer = 0

    def _rotate(self, direction):
        old_shape = self.current.shape
        old_rot = self.current.rotation
        self.current.rotate(direction)
        # Wall kicks: try offsets
        for dx, dy in [(0, 0), (-1, 0), (1, 0), (-2, 0), (2, 0), (0, -1)]:
            if self.board.is_valid(self.current, dx=dx, dy=dy):
                self.current.x += dx
                self.current.y += dy
                self.lock_timer = 0
                return
        self.current.rotation = old_rot
        self.current.shape = old_shape

    def _hard_drop(self):
        dy = 0
        while self.board.is_valid(self.current, dy=dy + 1):
            dy += 1
        self.current.y += dy
        self.score += dy * 2
        self._lock()

    def _lock(self):
        self.board.lock(self.current)
        cleared = self.board.clear_lines()
        self.lines += cleared
        self.score += [0, 100, 300, 500, 800][cleared] * self.level
        self.level = self.lines // 10 + 1
        self.fall_speed = max(80, INITIAL_FALL_SPEED - (self.level - 1) * 40)
        self._spawn()
        self.fall_timer = 0
        self.lock_timer = 0

    def handle_input(self, dt):
        keys = pygame.key.get_pressed()

        # Horizontal DAS/ARR
        new_dir = 0
        if keys[pygame.K_LEFT]:
            new_dir = -1
        elif keys[pygame.K_RIGHT]:
            new_dir = 1

        if new_dir != self.move_dir:
            self.move_dir = new_dir
            self.das_timer = 0
            self.arr_timer = 0
            if new_dir:
                self._move(new_dir)
        elif new_dir:
            self.das_timer += dt
            if self.das_timer >= self.das_delay:
                self.arr_timer += dt
                if self.arr_timer >= self.arr_delay:
                    self._move(new_dir)
                    self.arr_timer = 0

        # Soft drop
        if keys[pygame.K_DOWN]:
            if self.board.is_valid(self.current, dy=1):
                self.current.y += 1
                self.score += 1
                self.fall_timer = 0

    def update(self, dt):
        if self.game_over or self.paused:
            return

        self.handle_input(dt)
        self.fall_timer += dt

        if self.fall_timer >= self.fall_speed:
            self.fall_timer = 0
            if self.board.is_valid(self.current, dy=1):
                self.current.y += 1
            else:
                self.lock_timer += self.fall_speed
                if self.lock_timer >= self.lock_delay:
                    self._lock()

    def handle_event(self, event):
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                pygame.quit()
                sys.exit()
            if event.key == pygame.K_p:
                self.paused = not self.paused
            if self.game_over:
                if event.key == pygame.K_r:
                    self.reset()
                return
            if self.paused:
                return
            if event.key == pygame.K_LEFT:
                self._move(-1)
            elif event.key == pygame.K_RIGHT:
                self._move(1)
            elif event.key == pygame.K_UP or event.key == pygame.K_x:
                self._rotate(1)
            elif event.key == pygame.K_z:
                self._rotate(-1)
            elif event.key == pygame.K_SPACE:
                self._hard_drop()
            elif event.key == pygame.K_c or event.key == pygame.K_LSHIFT:
                self.hold()

    def _draw_cell(self, surface, col, row, color, alpha=255, offset_x=0, offset_y=0):
        x = offset_x + col * CELL_SIZE
        y = offset_y + row * CELL_SIZE
        rect = pygame.Rect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2)
        if alpha < 255:
            s = pygame.Surface((CELL_SIZE - 2, CELL_SIZE - 2), pygame.SRCALPHA)
            s.fill((*color, alpha))
            surface.blit(s, (x + 1, y + 1))
        else:
            pygame.draw.rect(surface, color, rect, border_radius=3)
            highlight = tuple(min(255, c + 60) for c in color)
            pygame.draw.rect(surface, highlight, (x + 1, y + 1, CELL_SIZE - 2, 4), border_radius=2)

    def draw(self):
        self.screen.fill(COLORS["bg"])

        # Board background
        board_rect = pygame.Rect(BOARD_X - 2, BOARD_Y - 2,
                                 BOARD_WIDTH * CELL_SIZE + 4,
                                 BOARD_HEIGHT * CELL_SIZE + 4)
        pygame.draw.rect(self.screen, COLORS["board_bg"], board_rect)
        pygame.draw.rect(self.screen, COLORS["border"], board_rect, 2)

        # Grid lines
        for r in range(BOARD_HEIGHT + 1):
            pygame.draw.line(self.screen, COLORS["grid"],
                             (BOARD_X, BOARD_Y + r * CELL_SIZE),
                             (BOARD_X + BOARD_WIDTH * CELL_SIZE, BOARD_Y + r * CELL_SIZE))
        for c in range(BOARD_WIDTH + 1):
            pygame.draw.line(self.screen, COLORS["grid"],
                             (BOARD_X + c * CELL_SIZE, BOARD_Y),
                             (BOARD_X + c * CELL_SIZE, BOARD_Y + BOARD_HEIGHT * CELL_SIZE))

        # Locked cells
        for r, row in enumerate(self.board.grid):
            for c, color in enumerate(row):
                if color:
                    self._draw_cell(self.screen, c, r, color, offset_x=BOARD_X, offset_y=BOARD_Y)

        if not self.game_over:
            # Ghost piece
            ghost_y = self.board.ghost_y(self.current)
            if ghost_y != self.current.y:
                for col, row in self.current.get_blocks(y=ghost_y):
                    self._draw_cell(self.screen, col, row, COLORS["ghost"],
                                    offset_x=BOARD_X, offset_y=BOARD_Y)

            # Current piece
            for col, row in self.current.get_blocks():
                if row >= 0:
                    self._draw_cell(self.screen, col, row, self.current.color,
                                    offset_x=BOARD_X, offset_y=BOARD_Y)

        # Right panel
        panel_x = BOARD_X + BOARD_WIDTH * CELL_SIZE + 20

        def draw_label(text, y, dim=True):
            color = COLORS["text_dim"] if dim else COLORS["text"]
            surf = self.font_small.render(text, True, color)
            self.screen.blit(surf, (panel_x, y))

        def draw_value(text, y):
            surf = self.font_med.render(text, True, COLORS["text"])
            self.screen.blit(surf, (panel_x, y))

        def draw_mini_piece(piece, y):
            if piece is None:
                return
            shape = piece.rotations[0]
            cols = len(shape[0])
            rows = len(shape)
            cell = 18
            ox = panel_x + (80 - cols * cell) // 2
            oy = y
            for r, line in enumerate(shape):
                for c, cell_val in enumerate(line):
                    if cell_val:
                        rect = pygame.Rect(ox + c * cell + 1, oy + r * cell + 1, cell - 2, cell - 2)
                        pygame.draw.rect(self.screen, piece.color, rect, border_radius=2)

        # NEXT
        draw_label("NEXT", BOARD_Y)
        draw_mini_piece(self.next, BOARD_Y + 22)

        # HOLD
        draw_label("HOLD", BOARD_Y + 110)
        draw_mini_piece(self.held, BOARD_Y + 132)

        # SCORE / LINES / LEVEL
        draw_label("SCORE", BOARD_Y + 230)
        draw_value(str(self.score), BOARD_Y + 250)
        draw_label("LINES", BOARD_Y + 290)
        draw_value(str(self.lines), BOARD_Y + 310)
        draw_label("LEVEL", BOARD_Y + 350)
        draw_value(str(self.level), BOARD_Y + 370)

        # Controls hint
        hints = ["←→  移动", "↑/X  顺转", "Z  逆转", "↓  加速", "空格 硬降", "C  暂存", "P  暂停"]
        for i, h in enumerate(hints):
            surf = self.font_small.render(h, True, COLORS["text_dim"])
            self.screen.blit(surf, (panel_x, BOARD_Y + 430 + i * 22))

        # Overlays
        if self.paused and not self.game_over:
            self._draw_overlay("暂停", "按 P 继续")
        if self.game_over:
            self._draw_overlay("游戏结束", f"得分: {self.score}  按 R 重玩")

        pygame.display.flip()

    def _draw_overlay(self, title, subtitle):
        overlay = pygame.Surface((BOARD_WIDTH * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE), pygame.SRCALPHA)
        overlay.fill((0, 0, 0, 160))
        self.screen.blit(overlay, (BOARD_X, BOARD_Y))
        t = self.font_large.render(title, True, COLORS["text"])
        self.screen.blit(t, (BOARD_X + (BOARD_WIDTH * CELL_SIZE - t.get_width()) // 2,
                              BOARD_Y + BOARD_HEIGHT * CELL_SIZE // 2 - 40))
        s = self.font_med.render(subtitle, True, COLORS["text_dim"])
        self.screen.blit(s, (BOARD_X + (BOARD_WIDTH * CELL_SIZE - s.get_width()) // 2,
                              BOARD_Y + BOARD_HEIGHT * CELL_SIZE // 2 + 10))

    def run(self):
        while True:
            dt = self.clock.tick(FPS)
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                self.handle_event(event)
            self.update(dt)
            self.draw()


if __name__ == "__main__":
    Game().run()
