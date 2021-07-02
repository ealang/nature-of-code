#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <memory.h>
#include <stdlib.h>

#define FIELD_SIZE_BITS 6
#define FIELD_SIZE (1 << FIELD_SIZE_BITS)
#define FIELD_ARRAY_B ((FIELD_SIZE * FIELD_SIZE) >> 3)
#define MAX_NUM_ITER 10000
#define CHECK_ITER 100

uint8_t get_cell(const char *board, int x, int y) {
    int i = (y << FIELD_SIZE_BITS) + x;
    char m = board[i >> 3] & (1 << (i & 7));
    return m ? 1 : 0;
}

void set_cell(char *board, uint8_t v, int x, int y) {
    int i = (y << FIELD_SIZE_BITS) + x;
    int bit_mask = 1 << (i & 7);

    char *cur = &board[i >> 3];
    if (v) {
        *cur |= bit_mask;
    } else {
        *cur &= ~bit_mask;
    }
}

char* initial_board() {
    srand(0);
    char *board = (char*)malloc(FIELD_ARRAY_B);
    memset(board, 0, FIELD_ARRAY_B);
    /*
    #define INIT_FILL_RATIO 0.5
    for (int i = 0; i < (int)(FIELD_SIZE * FIELD_SIZE * INIT_FILL_RATIO); ++i) {
        int x = rand() % FIELD_SIZE;
        int y = rand() % FIELD_SIZE;
        set_cell(board, 1, x, y);
    }
    */
    set_cell(board, 1, FIELD_SIZE >> 1, FIELD_SIZE >> 1);
    return board;
}

void print_board(const char *board) {
    for (int y = 0; y < FIELD_SIZE; ++y) {
        for (int x = 0; x < FIELD_SIZE; ++x) {
            printf("%c", get_cell(board, x, y) ? '#' : ' ');
        }
        printf("\n");
    }
}

int board_is_trivial(const char *board, const char *board2) {
    int v = board[0];
    int all_m = board[0] == board2[0];
    for (int i = 1; i < FIELD_ARRAY_B; ++i) {
        if (board[i] != board2[i]) {
            all_m = 0;

        }
        if (!all_m && board[i] != v) {
            return 0;
        }
    }
    return 1;
}

void iterate_board(const char *src, char *dst, uint32_t rule_num) {
    memset(dst, 0, FIELD_ARRAY_B);
    for (int y = 0; y < FIELD_SIZE; ++y) {
        for (int x = 0; x < FIELD_SIZE; ++x) {
            int xp = (x + 1) % FIELD_SIZE;
            int xm = (x - 1) % FIELD_SIZE;
            int yp = (y + 1) % FIELD_SIZE;
            int ym = (y - 1) % FIELD_SIZE;

            int b1 = get_cell(src, x, y);
            int b2 = get_cell(src, xp, y);
            int b3 = get_cell(src, x, yp);
            int b4 = get_cell(src, xm, y);
            int b5 = get_cell(src, x, ym);

            int lookup = b1 | (b2 << 1) | (b3 << 2) | (b4 << 3) | (b5 << 4);
            int v = (rule_num & (1 << lookup)) ? 1 : 0;
            set_cell(dst, v, x, y);
        }
    }
}

int run_rule(const char *init_board, uint32_t rule_num, int log) {
    char *board1 = (char*)malloc(FIELD_ARRAY_B);
    char *board2 = (char*)malloc(FIELD_ARRAY_B);
    memcpy(board1, init_board, FIELD_ARRAY_B);

    int i;
    for (i = 0; i < MAX_NUM_ITER; ++i) {
        const char* curBoard;
        if (i & 1) {
            iterate_board(board2, board1, rule_num);
            curBoard = board1;
        } else {
            iterate_board(board1, board2, rule_num);
            curBoard = board2;
        }

        if (log) {
            printf("----------------------\n%d\n", i);
            print_board(curBoard);
        }

        if (i && i % CHECK_ITER == 0) {
            if (board_is_trivial(board1, board2)) {
                break;
            }
        }
    }
    free(board1);
    free(board2);
    if (i == MAX_NUM_ITER) {
        print_board(board1);
    }
    return i;
}

uint32_t rand32() {
    uint32_t i = rand() & 0xFF;
    i <<= 8;
    i |= rand() & 0xFF;
    i <<= 8;
    i |= rand() & 0xFF;
    i <<= 8;
    i |= rand() & 0xFF;
    return i;
}

void main_search() {
    const char *board = initial_board();

    int i;
    while (1) {
        uint32_t rule = rand32();
        int num_iter = run_rule(board, rule, 0);
        if (num_iter > CHECK_ITER) {
            printf("%d %d %d\n", i, rule, num_iter);
        }
        ++i;
        if (i % 1000000 == 0) {
            printf("%d\n", i);
        }
    }
}

void main_render() {
    char *board = initial_board();
    uint32_t rule = 1;//35323459;//-218373306;
    run_rule(board, rule, 1);
}

int main() {

    main_render();
    //main_search();
    return 0;
}
