// When the logo button is pressed, perform the following actions
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    // Stop NezhaV2 motor M1
    nezhaV2.nezha2MotorStop(NezhaV2MotorPostion.M1)
    // Reset the position of NezhaV2 motor M1
    nezhaV2.servoPostionReset(NezhaV2MotorPostion.M1)
})

// When button A is pressed, perform the following actions
input.onButtonPressed(Button.A, function () {
    // Set the speed of NezhaV2 motor M1 to 0 degrees/second, in clockwise direction, using degrees as the unit
    nezhaV2.motorSpeed(NezhaV2MotorPostion.M1, NezhaV2MovementDirection.CW, 0, NezhaV2SportsMode.Degree)
    // Move NezhaV2 motor M1 to the absolute position 0, in clockwise direction
    nezhaV2.goToAbsolutePosition(NezhaV2MotorPostion.M1, NezhaV2ServoMotionMode.CW, 0)
    // Start NezhaV2 motor M1, in clockwise direction
    //nezhaV2.nezha2MotorStart(NezhaV2MotorPostion.M1, NezhaV2MovementDirection.CW)
    // Set the speed control output of NezhaV2 motor M1 to 66 (assuming this is a valid value for speed control)
    nezhaV2.nezha2MotorSpeedCtrolExport(NezhaV2MotorPostion.M1, 66)
    // Display the current absolute position of NezhaV2 motor M1
    basic.showNumber(nezhaV2.readServoAbsolutePostion(NezhaV2MotorPostion.M1))
    // Display the current absolute speed of NezhaV2 motor M1
    // Note: The closing parenthesis for the previous line was missing, added it here
    basic.showNumber(nezhaV2.readServoAbsoluteSpeed(NezhaV2MotorPostion.M1))
})