# caesar_encrypt.py
import sys


def caesar_encrypt(text, shift=3):  # 默认位移量为3
    result = ""

    for i in range(len(text)):
        char = text[i]

        if char.isupper():
            result += chr((ord(char) + shift - 65) % 26 + 65)
        elif char.islower():
            result += chr((ord(char) + shift - 97) % 26 + 97)
        else:
            result += char

    return result


def main():
    if len(sys.argv) != 3:
        print("Usage: python caesar_encrypt.py <inputfile> <outputfile>")
        sys.exit(1)

    inputfile = sys.argv[1]
    outputfile = sys.argv[2]

    with open(inputfile, 'r') as file:
        text = file.read()

    encrypted_text = caesar_encrypt(text)

    with open(outputfile, 'w') as file:
        file.write(encrypted_text)

    print(f"Encryption complete! Check the '{outputfile}' file.")


if __name__ == "__main__":
    main()
