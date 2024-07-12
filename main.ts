enum motorPostion {
    //%block="A"
    M1 = 1,
    //%block="B"
    M2 = 2,
    //%block="C"
    M3 = 3,
    //%block="D"
    M4 = 4
}

enum movementDirection {
    //%block="clockwise"
    CW = 1,
    //%block="counterclockwise"
    CCW = 2
}

enum sportsMode {
    //%block="degrees"
    DEGREE = 2,
    //%block="turns"
    CIRCLE = 1,
    //%block="seconds"
    SECOND = 3
}

enum servoMotionMode {
    //%block="clockwise"
    CW = 2,
    //%block="shortest path"
    SHORTESTPATH = 1,
    //%block="counterclockwise"
    CCW = 3
}

enum motorPostionLeft {
    //%block="A"
    A = 1,
    //%block="B"
    B = 2,
    //%block="C"
    C = 3,
    //%block="D"
    DEGREE = 4
}
enum motorPostionRight {
    //%block="A"
    A = 1,
    //%block="B"
    B = 2,
    //%block="C"
    C = 3,
    //%block="D"
    DEGREE = 4
}


enum VerticallDirection {
    //%block="forward"
    UP = 1,
    //%block="backward"
    DOWM = 2
}


//% color=#ff0011  icon="\uf06d" block="nezhaV2" blockId="nezhaV2"
namespace nezhaV2 {
    let i2cAddr: number = 0x10;
    let setMotorCombination = 0;
    let getMotorCombinationSpeed = 0;
    let motorspeedGlobal = 0

    let buf = pins.createBuffer(8)
    buf[0] = 0xFF;
    buf[1] = 0xF9;
    buf[2] = 0x00;
    buf[3] = 0x00;
    buf[4] = 0x00;
    buf[5] = 0x00;
    buf[6] = 0xF5;
    buf[7] = 0x00;
    pins.i2cWriteBuffer(i2cAddr, buf);

    //% groUP="Basic functions"
    //% block="Set %motorPostion to run %movementDirection %speed  %sportsMode"
    //% inlineInputMode=inline
    //% weight=407 
    export function motorSpeed(motor: motorPostion, direction: movementDirection, speed: number, MotorFunction: sportsMode): void {
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = direction;
        buf[4] = 0x70;
        buf[5] = (speed >> 8) & 0XFF;
        buf[6] = MotorFunction;
        buf[7] = (speed >> 0) & 0XFF;
        pins.i2cWriteBuffer(i2cAddr, buf);
    }

    //% groUP="Basic functions"
    //% weight=406
    //% block="Set %motorPostion to rotate %servoMotionMode at angle %target_angle"
    //% target_angle.min=0  target_angle.max=360
    export function goToAbsolutePosition(motor: motorPostion, modePostion: servoMotionMode, target_angle: number): void {
        while (target_angle < 0) {
            target_angle += 360
        }
        target_angle %= 360
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = 0x00;
        buf[4] = 0x5D;
        buf[5] = (target_angle >> 8) & 0XFF;
        buf[6] = modePostion;
        buf[7] = (target_angle >> 0) & 0XFF;
        pins.i2cWriteBuffer(i2cAddr, buf);
        basic.pause(5);
    }

    //% groUP="Basic functions"
    //% weight=405
    //% block="Setting %motorPostion to start the motor in %movementDirection"
    //% speed.min=0  speed.max=100
    export function nezha2MotorStart(motor: motorPostion, direction: movementDirection): void {
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = direction;
        buf[4] = 0x5E;
        buf[5] = 0x00;
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);

    }

    //% groUP="Basic functions"
    //% weight=404
    //% block="Set %motorPostion shutting down the motor"
    //% speed.min=0  speed.max=100
    export function nezha2MotorStop(motor: motorPostion,): void {
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = 0x00;
        buf[4] = 0x5F;
        buf[5] = 0x00;
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);
    }

    //% groUP="Basic functions"
    //% weight=403
    //% block="Set %motorPostion speed to %speed\\%"
    //% speed.min=-100  speed.max=100
    export function nezha2MotorSpeedCtrolExport(motor: motorPostion, speed: number): void {
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        if (speed > 0) {
            buf[3] = movementDirection.CW;
        }
        else {
            buf[3] = movementDirection.CCW;
        }
        buf[4] = 0x60;
        buf[5] = Math.abs(speed);
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);
    }

    function nezha2MotorSpeedCtrol(motor: motorPostion, direction: movementDirection, speed: number): void {
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = direction;
        buf[4] = 0x60;
        buf[5] = speed;
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);
    }

    //% groUP="Basic functions"
    //% weight=402
    //%block="%motorPostion Angular value"
    export function readServoAbsolutePostion(motor: motorPostion): number {
        let buf = pins.createBuffer(8);
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = 0x00;
        buf[4] = 0x46;
        buf[5] = 0x00;
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);
        basic.pause(4);
        let arr = pins.i2cReadBuffer(i2cAddr, 4);
        let position = (arr[3] << 24) | (arr[2] << 16) | (arr[1] << 8) | (arr[0]);
        while (position < 0) {
            position += 3600;
        }
        return (position % 3600) * 0.1;
    }

    //% groUP="Basic functions"
    //% weight=400
    //%block="%motorPostion Speed (laps/sec)"
    export function readServoAbsoluteSpeed(motor: motorPostion): number {
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = 0x00;
        buf[4] = 0x47;
        buf[5] = 0x00;
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);
        basic.pause(3);
        let ServoSpeed1Arr = pins.i2cReadBuffer(i2cAddr, 2);
        let Servo1Speed = (ServoSpeed1Arr[1] << 8) | (ServoSpeed1Arr[0]);
        return Math.floor(Servo1Speed * 0.0926);
    }

    //% groUP="Basic functions"
    //% weight=399
    //%block="Set motor %motorPostion to zero"
    export function servoPostionReset(motor: motorPostion): void {
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = 0x00;
        buf[4] = 0x1D;
        buf[5] = 0x00;
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);

    }
    let motorLeftGlobal = 0
    let motorRightGlobal = 0
    //% groUP="Application functions"
    //% weight=410
    //%block="Set the running motor to left wheel %motorPostionLeft right wheel %motorPostionRight"
    export function runningMotorToeSpeed(motorLeft: motorPostionLeft, motorRight: motorPostionRight): void {
        motorLeftGlobal = motorLeft
        motorRightGlobal = motorRight
    }

    //% groUP="Application functions"
    //% weight=409
    //%block="Set the speed to %speed \\%"
    //% speed.min=0  speed.max=100
    export function setMotionSpeed(speed: number): void {
        motorspeedGlobal = speed
    }

    //% groUP="Application functions"
    //% weight=406
    //%block="Stop movement"
    export function stopCombinationMotor(): void {
        nezha2MotorStop(motorLeftGlobal)
        nezha2MotorStop(motorRightGlobal)
    }

    //% groUP="Application functions"
    //% weight=405
    //%block="Combination Motor Move to %VerticallDirection"
    //%block="Move %VerticallDirection"

    export function combinationMotorVerticallDirectionMove(verticallDirection: VerticallDirection): void {
        switch (verticallDirection) {
            case VerticallDirection.UP:
                nezha2MotorSpeedCtrol(motorLeftGlobal, movementDirection.CCW, motorspeedGlobal)
                nezha2MotorSpeedCtrol(motorRightGlobal, movementDirection.CW, motorspeedGlobal)
                break
            case VerticallDirection.DOWM:
                nezha2MotorSpeedCtrol(motorLeftGlobal, movementDirection.CW, motorspeedGlobal)
                nezha2MotorSpeedCtrol(motorRightGlobal, movementDirection.CCW, motorspeedGlobal)
                break
        }

    }

    //% groUP="Application functions"
    //% weight=402
    //%block="Set the left wheel speed at %speedleft \\%, right wheel speed at %speedright \\%"
    //% speedleft.min=-100  speedleft.max=100 speedright.min=-100  speedright.max=100
    export function setSpeedfLeftRightWheel(speedleft: number, speedright: number): void {
        if (speedleft > 0) {
            nezha2MotorSpeedCtrol(motorLeftGlobal, movementDirection.CCW, speedleft)
        }
        else {
            nezha2MotorSpeedCtrol(motorLeftGlobal, movementDirection.CW, Math.abs(speedleft))
        }
        if (speedright > 0) {
            nezha2MotorSpeedCtrol(motorRightGlobal, movementDirection.CW, speedright)
        }
        else {
            nezha2MotorSpeedCtrol(motorRightGlobal, movementDirection.CCW, Math.abs(speedright))
        }

    }

    //% groUP="export functions"
    //% weight=320
    //%block="Version Number"
    export function readVersion(): string {
        let buf = pins.createBuffer(8);
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = 0x00;
        buf[3] = 0x00;
        buf[4] = 0x88;
        buf[5] = 0x00;
        buf[6] = 0x00;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);
        let version = pins.i2cReadBuffer(i2cAddr, 3);
        return `V ${version[0]}.${version[1]}.${version[2]}`;
    }
}