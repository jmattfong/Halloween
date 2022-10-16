import RPi.GPIO as GPIO
import time


ENABLE_PIN = 12
COIL_A_1_PIN = 16  # RED
COIL_A_2_PIN = 18  # YELLOW
COIL_B_1_PIN = 7  # GREY
COIL_B_2_PIN = 11  # GREEN


def setup(channels):

    print("Starting up")
    print("setting gpio to board mode")
    GPIO.setmode(GPIO.BOARD)
    for x in range(1, 41):
        try:
            result = GPIO.gpio_function(x)
            print(f"found available for pin {x}: {result}")

        except Exception as e:
            print(f"error: {e}")

    for p in channels:
        result = GPIO.gpio_function(p)
        print(f"found available for pin {p}: {result}")
    GPIO.setup(channels, GPIO.OUT)
    GPIO.output(ENABLE_PIN, GPIO.HIGH)


def set_step(channels, *values):
    print("Setting the channels")
    print("------------------------")
    i = 0
    for c in channels:
        print(f"{c} | {values[i]}")
        i += 1
    GPIO.output(channels, values)


def cleanup():
    GPIO.cleanup()


def main(channels):

    while True:
        forward(channels, 2, 100)

        print("DONE AGAIN. Starting again")


def forward(channels, delay_sec: float, steps: int):
    for i in range(1, steps + 1):
        set_step(channels, GPIO.HIGH, GPIO.LOW, GPIO.HIGH, GPIO.LOW)
        time.sleep(delay_sec)
        set_step(channels, GPIO.LOW, GPIO.HIGH, GPIO.HIGH, GPIO.LOW)
        time.sleep(delay_sec)
        set_step(channels, GPIO.LOW, GPIO.HIGH, GPIO.LOW, GPIO.HIGH)
        time.sleep(delay_sec)
        set_step(channels, GPIO.HIGH, GPIO.LOW, GPIO.LOW, GPIO.HIGH)
        time.sleep(delay_sec)
        print(f"step #{i}")


if __name__ == "__main__":
    channels = [ENABLE_PIN, COIL_A_1_PIN, COIL_A_2_PIN, COIL_B_1_PIN, COIL_B_2_PIN]
    try:
        setup(channels)

        while True:

            print(f"{COIL_A_1_PIN}: going high")
            GPIO.output(COIL_A_1_PIN, GPIO.HIGH)

            time.sleep(4)

            print(f"{COIL_A_1_PIN}: going LOW")
            GPIO.output(COIL_A_1_PIN, GPIO.LOW)

            time.sleep(4)

        # main(channels[1:])

    finally:
        cleanup()
