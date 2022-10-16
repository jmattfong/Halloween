import RPi.GPIO as GPIO
import time


ENABLE_PIN = 18
COIL_A_1_PIN = 4
COIL_A_2_PIN = 17
COIL_B_1_PIN = 23
COIL_B_2_PIN = 24


def setup(channels: list[int]):
    print(f"Starting up")
    print("setting gpio to board mode")
    GPIO.setmode(GPIO.BOARD)
    GPIO.output(ENABLE_PIN, GPIO.HIGH)
    GPIO.setup(channels, GPIO.OUT)


def set_step(channels: list[int], a1_value, a2_value, b1_value, b2_value):
    GPIO.output(channels, [a1_value, a2_value, b1_value, b2_value])


def cleanup():
    GPIO.cleanup()


def main(channels):

    while True:
        forward(channels, 1, 100)

        print("DONE AGAIN. Starting again")


def forward(channels, delay_sec: float, steps: int):
    i = 0
    while i in range(0, steps):
        set_step(channels, GPIO.HIGH, GPIO.LOW, GPIO.HIGH, GPIO.LOW)
        time.sleep(delay_sec)
        set_step(channels, GPIO.LOW, GPIO.HIGH, GPIO.HIGH, GPIO.LOW)
        time.sleep(delay_sec)
        set_step(channels, GPIO.LOW, GPIO.HIGH, GPIO.LOW, GPIO.HIGH)
        time.sleep(delay_sec)
        set_step(channels, GPIO.HIGH, GPIO.LOW, GPIO.LOW, GPIO.HIGH)
        time.sleep(delay_sec)
        i += 1


if __name__ == "__main__":
    channels = [ENABLE_PIN, COIL_A_1_PIN, COIL_A_2_PIN, COIL_B_1_PIN, COIL_B_2_PIN]
    try:
        setup(channels)

        main(channels)

    finally:
        cleanup()
