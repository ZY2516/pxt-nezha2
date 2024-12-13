

enum NezhaV2MovementDirection {
    //%block="clockwise"
    CW = 1,
    //%block="counterclockwise"
    CCW = 2
}
enum NezhaV2ServoMotionMode {
    //%block="clockwise"
    CW = 2,
    //%block="counterclockwise"
    CCW = 3,
    //%block="shortest path"
    ShortPath = 1
}

enum NezhaV2DelayMode {
    //%block="automatic delay"
    AutoDelayStatus = 1,
    //%block="no delay"
    NoDelay = 0
}
enum NezhaV2SportsMode {
    //%block="degrees"
    Degree = 2,
    //%block="turns"
    Circle = 1,
    //%block="seconds"
    Second = 3
}


enum NezhaV2MotorPostionLeft {
    //%block="M1"
    A = 1,
    //%block="M2"
    B = 2,
    //%block="M3"
    C = 3,
    //%block="M4"
    Degree = 4
}

enum NezhaV2MotorPostionRight {
    //%block="M1"
    A = 1,
    //%block="M2"
    B = 2,
    //%block="M3"
    C = 3,
    //%block="M4"
    Degree = 4
}


enum NezhaV2VerticallDirection {
    //%block="forward"
    Up = 1,
    //%block="backward"
    Down = 2
}

enum NezhaV2Uint {

    //%block="cm"
    cm = 1,
    //%block="inch"
    inch = 2
}

enum NezhaV2NezhaV2DistanceAndAngleUnit {
    //%block="degrees"
    Degree = 2,
    //%block="turns"
    Circle = 1,
    //%block="seconds"
    Second = 3,
    //%block="cm"
    cm = 4,
    //%block="inch"
    inch = 5
}

enum NezhaV2MotorPostion {
    //%block="M1"
    M1 = 1,
    //%block="M2"
    M2 = 2,
    //%block="M3"
    M3 = 3,
    //%block="M4"
    M4 = 4
}


//% color=#ff0011  icon="\uf06d" block="nezhaV2" blockId="nezhaV2"
namespace nezhaV2 {

    let i2cAddr: number = 0x10;
    let servoSpeedGlobal = 900
    let motorWorkdoneTimeArr = [0, 0, 0, 0];
    // 相对角度值(用于相对角度值归零函数)
    let relativeAngularArr = [0, 0, 0, 0];
    // 组合积木块变量
    let motorLeftGlobal = 0
    let motorRightGlobal = 0
    let degreeToDistance = 0


    export function motorDelay(motor: NezhaV2MotorPostion, speed: number, motorFunction: NezhaV2SportsMode) {

        let now = input.runningTime();
        let motorWorkdoneTime = motorWorkdoneTimeArr[motor];
        if (now < motorWorkdoneTime) {
            basic.pause(motorWorkdoneTime - now);
            now = input.runningTime();
        }

        if (speed == 0 || servoSpeedGlobal == 0) {
            motorWorkdoneTimeArr[motor] = 0;
            return;
        }

        if (motorFunction == NezhaV2SportsMode.Circle) {
            motorWorkdoneTimeArr[motor] = now + speed * 360000.0 / servoSpeedGlobal + 500;
        } else if (motorFunction == NezhaV2SportsMode.Second) {
            motorWorkdoneTimeArr[motor] = now + (speed * 1000);
        } else if (motorFunction == NezhaV2SportsMode.Degree) {
            motorWorkdoneTimeArr[motor] = now + speed * 1000.0 / servoSpeedGlobal + 500;
        }

    }

    /**
     * Sets the speed and direction of the motor.
     *
     * @param motor The position of the motor, of the enum type NezhaV2MotorPosition.
     * @param direction The direction of movement, of the enum type NezhaV2MovementDirection.
     * @param speed The speed of the motor, ranging from 0 to 255.
     * @param motorFunction The sports mode of the motor, of the enum type NezhaV2SportsMode.
     * @returns This function does not return any value.
     */
    //% group="Basic functions"
    //% block="set %NezhaV2MotorPostion to run %NezhaV2MovementDirection %speed  %NezhaV2SportsMode || %delayMode"
    //% inlineInputMode=inline
    //% weight=407 
    export function motorSpeed(motor: NezhaV2MotorPostion, direction: NezhaV2MovementDirection, speed: number, motorFunction: NezhaV2SportsMode, delayMode: NezhaV2DelayMode = NezhaV2DelayMode.AutoDelayStatus): void {
        if (delayMode) {
            motorDelay(motor, speed, motorFunction);
        }
        else {
            motorDelay(motor, 0, 1)
        }
        let buf = pins.createBuffer(8);
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = direction;
        buf[4] = 0x70;
        buf[5] = (speed >> 8) & 0XFF;
        buf[6] = motorFunction;
        buf[7] = (speed >> 0) & 0XFF;
        pins.i2cWriteBuffer(i2cAddr, buf);
    }


    /**
     * Moves the servo motor to an absolute position.
     *
     * @param motor The position of the servo motor, ranging from 0 to 255.
     * @param modePosition The direction of movement for the servo motor, ranging from 0 to 255.
     * @param targetAngle The target angle, ranging from 0 to 359. If less than 0, it will be automatically converted to a positive number.
     */
    //% group="Basic functions"
    //% weight=406
    //% block="set %NezhaV2MotorPostion to rotate %NezhaV2MovementDirection at angle %targetAngle || %delayMode  "
    //% targetAngle.min=0  targetAngle.max=360
    //% inlineInputMode=inline
    export function goToAbsolutePosition(motor: NezhaV2MotorPostion, modePostion: NezhaV2ServoMotionMode, targetAngle: number, delayMode: NezhaV2DelayMode = NezhaV2DelayMode.AutoDelayStatus): void {

        while (targetAngle < 0) {
            targetAngle += 360
        }
        if (delayMode) {
            motorDelay(motor, 0.5, 1)
        }
        else {
            motorDelay(motor, 0, 1)
        }

        targetAngle %= 360
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = 0x00;
        buf[4] = 0x5D;
        buf[5] = (targetAngle >> 8) & 0XFF;
        buf[6] = modePostion;
        buf[7] = (targetAngle >> 0) & 0XFF;
        pins.i2cWriteBuffer(i2cAddr, buf);
        basic.pause(0.01);
    }

    /**
     * Starts the Nezha V2 motor.
     *
     * @param motor The position of the motor.
     * @param direction The direction of movement.
     * @returns This function does not return any value.
     */

    function nezha2MotorStart(motor: NezhaV2MotorPostion, direction: NezhaV2MovementDirection): void {
        motorDelay(motor, 0, 1)
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

    /**
     * Stops the Nezha V2 motor.
     *
     * @param motor The position of the Nezha V2 motor.
     * @returns This function does not return any value.
     */
    //% group="Basic functions"
    //% weight=404
    //% block="set %NezhaV2MotorPostion shutting down the motor"
    //% speed.min=0  speed.max=100
    export function nezha2MotorStop(motor: NezhaV2MotorPostion): void {
        motorDelay(motor, 0, 1)
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

    /**
     * Controls the speed of a Nezha V2 motor.
     *
     * @param motor The position of the Nezha V2 motor, specified by an enumeration.
     * @param speed The speed of the motor in revolutions per minute (RPM). 
     *              Positive values indicate forward rotation, while negative values indicate reverse rotation.
     * @returns This function does not return any value.
     */
    //% group="Basic functions"
    //% weight=403
    //% block="set the speed of %NezhaV2MotorPostion to %speed\\% and start the motor"
    //% speed.min=-100  speed.max=100
    export function nezha2MotorSpeedCtrolExport(motor: NezhaV2MotorPostion, speed: number): void {
        motorDelay(motor, 0, 1)
        let dir = NezhaV2MovementDirection.CW
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        if (speed > 0) {
            buf[3] = NezhaV2MovementDirection.CW;
        }
        else {
            buf[3] = NezhaV2MovementDirection.CCW;
            dir = NezhaV2MovementDirection.CCW
        }
        buf[4] = 0x60;
        buf[5] = Math.abs(speed);
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);
        nezha2MotorSpeedCtrol(motor, dir, speed)
    }

    export function nezha2MotorSpeedCtrol(motor: NezhaV2MotorPostion, direction: NezhaV2MovementDirection, speed: number): void {
        motorDelay(motor, 0, 1)
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

    /**
     * Reads the absolute position of a servo motor.
     *
     * @param motor The motor position, ranging from 0x00 to 0x0F.
     * @returns The absolute position of the motor in degrees, ranging from 0 to 359.9.
     */
    //% group="Basic functions"
    //% weight=402
    //%block="%NezhaV2MotorPostion absolute angular value"
    export function readServoAbsolutePostion(motor: NezhaV2MotorPostion): number {
        let position = readPos(motor)
        while (position < 0) {
            position += 3600;
        }
        return (position % 3600) * 0.1;
    }
    //% group="Basic functions"
    //% weight=402
    //%block="%NezhaV2MotorPostion relative angular value"
    export function readServoRelativePostion(motor: NezhaV2MotorPostion): number {
        return (readPos(motor) - relativeAngularArr[motor - 1]) * 0.1;
    }

    export function readPos(motor: NezhaV2MotorPostion): number {
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
        return (arr[3] << 24) | (arr[2] << 16) | (arr[1] << 8) | (arr[0]);
    }
    //% group="Basic functions"
    //% weight=399
    //%block="set servo %NezhaV2MotorPostion relative angular to zero"
    export function servoRelativePostionReset(motor: NezhaV2MotorPostion) {
        relativeAngularArr[motor - 1] = readPos(motor);
    }

    /**
     * Reads the absolute speed of the servo motor.
     *
     * @param motor The position of the servo motor, of the type NezhaV2MotorPosition.
     * @returns Returns the absolute speed of the servo motor, measured in degrees per second.
     */
    //% group="Basic functions"
    //% weight=400
    //%block="%NezhaV2MotorPostion speed (laps/sec)"
    export function readServoAbsoluteSpeed(motor: NezhaV2MotorPostion): number {
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

    /**
     * Resets the servo position.
     *
     * @param motor The enum value of NezhaV2MotorPosition, indicating the motor position.
     * @returns Does not return any value.
     */
    //% group="Basic functions"
    //% weight=399
    //%block="set servo %NezhaV2MotorPostion to zero"
    export function servoPostionReset(motor: NezhaV2MotorPostion): void {
        motorDelay(motor, 1, 1)
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
        relativeAngularArr[motor - 1] = 0;
    }

    //% group="Basic functions"
    //% weight=398
    //%block="Set the servo speed to  %speed \\%"
    //% speed.min=0  speed.max=100

    export function setServoSpeed(speed: number): void {
        speed *= 9
        servoSpeedGlobal = speed
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = 0x00;
        buf[3] = 0x00;
        buf[4] = 0x77;
        buf[5] = (speed >> 8) & 0XFF;
        buf[6] = 0x00;
        buf[7] = (speed >> 0) & 0XFF;
        pins.i2cWriteBuffer(i2cAddr, buf);

    }

    /**
     * Sets the motors to run to the target speeds.
     *
     * @param motorLeft The position of the left motor.
     * @param motorRight The position of the right motor.
     * @returns Does not return any value.
     */
    //% group="Application functions"
    //% weight=410
    //%block="set the running motor to left wheel %NezhaV2MotorPostionLeft right wheel %NezhaV2MotorPostionRight"
    export function runningMotorToeSpeed(motorLeft: NezhaV2MotorPostionLeft, motorRight: NezhaV2MotorPostionRight): void {
        motorLeftGlobal = motorLeft
        motorRightGlobal = motorRight
    }

    /**
     * Controls the combined movement of the Nezha V2 robot in vertical directions.
     *
     * @param verticallDirection The vertical direction, with values from the NezhaV2VerticallDirection enumeration.
     * @returns Does not return any value.
     */
    //% group="Application functions"
    //% weight=409
    //%block="Set %speed\\% speed and move %NezhaV2VerticallDirection"
    //% speed.min=0  speed.max=100
    export function combinationMotorNezhaV2VerticallDirectionMove(speed: number, verticallDirection: NezhaV2VerticallDirection): void {
        switch (verticallDirection) {
            case NezhaV2VerticallDirection.Up:
                nezha2MotorSpeedCtrol(motorLeftGlobal, NezhaV2MovementDirection.CCW, speed)
                nezha2MotorSpeedCtrol(motorRightGlobal, NezhaV2MovementDirection.CW, speed)
                break
            case NezhaV2VerticallDirection.Down:
                nezha2MotorSpeedCtrol(motorLeftGlobal, NezhaV2MovementDirection.CW, speed)
                nezha2MotorSpeedCtrol(motorRightGlobal, NezhaV2MovementDirection.CCW, speed)
                break
        }

    }


    /**
     * Stops the combined motors.
     *
     * @returns Does not return any value.
     */
    //% group="Application functions"
    //% weight=406
    //%block="stop movement"
    export function stopCombinationMotor(): void {
        nezha2MotorStop(motorLeftGlobal)
        nezha2MotorStop(motorRightGlobal)
    }


    //% group="Application functions"
    //% weight=404
    //%block="Rotate the motor once and set it to %far %Unit"
    export function SetMotorOneRotateRevolution(far: number, unit: NezhaV2Uint): void {
        if (unit == NezhaV2Uint.inch) {
            degreeToDistance = far * 0.3937
        }
        degreeToDistance = far

    }

    //% group="Application functions"
    //% weight=403
    //%block="Combination Motor Move to %VerticallDirection %speed %SportsMode "
    export function CombinationServoVerticallDirectionMove(verticallDirection: NezhaV2VerticallDirection, speed: number, MotorFunction: NezhaV2NezhaV2DistanceAndAngleUnit): void {
        switch (MotorFunction) {
            case NezhaV2NezhaV2DistanceAndAngleUnit.Circle:
                if (verticallDirection == NezhaV2VerticallDirection.Up) {
                    nezhaV2.motorSpeed(motorLeftGlobal, NezhaV2MovementDirection.CCW, speed, NezhaV2SportsMode.Circle)
                    nezhaV2.motorSpeed(motorRightGlobal, NezhaV2MovementDirection.CW, speed, NezhaV2SportsMode.Circle)
                } else {
                    nezhaV2.motorSpeed(motorLeftGlobal, NezhaV2MovementDirection.CW, speed, NezhaV2SportsMode.Circle)
                    nezhaV2.motorSpeed(motorRightGlobal, NezhaV2MovementDirection.CCW, speed, NezhaV2SportsMode.Circle)
                }
                break;
            case NezhaV2NezhaV2DistanceAndAngleUnit.Degree:
                if (verticallDirection == NezhaV2VerticallDirection.Up) {
                    nezhaV2.motorSpeed(motorLeftGlobal, NezhaV2MovementDirection.CCW, speed, NezhaV2SportsMode.Degree)
                    nezhaV2.motorSpeed(motorRightGlobal, NezhaV2MovementDirection.CW, speed, NezhaV2SportsMode.Degree)
                } else {
                    nezhaV2.motorSpeed(motorLeftGlobal, NezhaV2MovementDirection.CW, speed, NezhaV2SportsMode.Degree)
                    nezhaV2.motorSpeed(motorRightGlobal, NezhaV2MovementDirection.CCW, speed, NezhaV2SportsMode.Degree)
                }
                break;
            case NezhaV2NezhaV2DistanceAndAngleUnit.Second:
                if (verticallDirection == NezhaV2VerticallDirection.Up) {
                    nezhaV2.motorSpeed(motorLeftGlobal, NezhaV2MovementDirection.CCW, speed, NezhaV2SportsMode.Second)
                    nezhaV2.motorSpeed(motorRightGlobal, NezhaV2MovementDirection.CW, speed, NezhaV2SportsMode.Second)
                } else {
                    nezhaV2.motorSpeed(motorLeftGlobal, NezhaV2MovementDirection.CW, speed, NezhaV2SportsMode.Second)
                    nezhaV2.motorSpeed(motorRightGlobal, NezhaV2MovementDirection.CCW, speed, NezhaV2SportsMode.Second)
                }
                break;
            case NezhaV2NezhaV2DistanceAndAngleUnit.cm:
                let distanceCm = 360 * speed / degreeToDistance
                if (verticallDirection == NezhaV2VerticallDirection.Up) {
                    motorSpeed(motorLeftGlobal, NezhaV2MovementDirection.CCW, distanceCm, NezhaV2SportsMode.Degree)
                    motorSpeed(motorRightGlobal, NezhaV2MovementDirection.CW, distanceCm, NezhaV2SportsMode.Degree)
                }
                else {
                    motorSpeed(motorLeftGlobal, NezhaV2MovementDirection.CW, distanceCm, NezhaV2SportsMode.Degree)
                    motorSpeed(motorRightGlobal, NezhaV2MovementDirection.CCW, distanceCm, NezhaV2SportsMode.Degree)
                }
                break;
            case NezhaV2NezhaV2DistanceAndAngleUnit.inch:
                let distanceIrch = 360 * speed / degreeToDistance
                if (verticallDirection == NezhaV2VerticallDirection.Up) {
                    motorSpeed(motorLeftGlobal, NezhaV2MovementDirection.CCW, distanceIrch, NezhaV2SportsMode.Degree)
                    motorSpeed(motorRightGlobal, NezhaV2MovementDirection.CW, distanceIrch, NezhaV2SportsMode.Degree)
                }
                else {
                    motorSpeed(motorLeftGlobal, NezhaV2MovementDirection.CW, distanceIrch, NezhaV2SportsMode.Degree)
                    motorSpeed(motorRightGlobal, NezhaV2MovementDirection.CCW, distanceIrch, NezhaV2SportsMode.Degree)
                }
                break;


        }
    }

    /**
     * Sets the speed of the left and right wheels.
     *
     * @param speedleft The speed of the left wheel. A positive value indicates counter-clockwise rotation, while a negative value indicates clockwise rotation.
     * @param speedright The speed of the right wheel. A positive value indicates clockwise rotation, while a negative value indicates counter-clockwise rotation.
     * @returns Does not return any value.
     */
    //% group="Application functions"
    //% weight=402
    //%block="set the left wheel speed at %speedleft \\%, right wheel speed at %speedright \\% and start the motor"
    //% speedleft.min=-100  speedleft.max=100 speedright.min=-100  speedright.max=100
    export function setSpeedfLeftRightWheel(speedleft: number, speedright: number): void {
        let leftDir = NezhaV2MovementDirection.CCW
        let rightDir = NezhaV2MovementDirection.CW
        if (speedleft > 0) {
            nezha2MotorSpeedCtrol(motorLeftGlobal, NezhaV2MovementDirection.CCW, speedleft)
        }
        else {
            nezha2MotorSpeedCtrol(motorLeftGlobal, NezhaV2MovementDirection.CW, Math.abs(speedleft))
            leftDir = NezhaV2MovementDirection.CW
        }
        if (speedright > 0) {
            nezha2MotorSpeedCtrol(motorRightGlobal, NezhaV2MovementDirection.CW, speedright)
        }
        else {
            nezha2MotorSpeedCtrol(motorRightGlobal, NezhaV2MovementDirection.CCW, Math.abs(speedright))
            rightDir = NezhaV2MovementDirection.CCW
        }
        nezha2MotorSpeedCtrol(motorLeftGlobal, leftDir, speedleft)
        nezha2MotorSpeedCtrol(motorRightGlobal, rightDir, speedright)
    }

    /**
     * Reads the version information.
     *
     * @returns Returns a version string in the format of `V x.y.z`.
     */
    //% group="export functions"
    //% weight=320
    //%block="version number"
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
