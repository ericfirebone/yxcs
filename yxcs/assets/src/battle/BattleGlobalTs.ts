const {ccclass, property} = cc._decorator;

@ccclass
export class BattleGlobalTs
{
    static oldPos:cc.Vec2=null;
    static newPos:cc.Vec2=null;
    static snapTag:string=null;
    static snapName:string=null;
    static crossFlag:Boolean=false;
    @property(cc.Integer)
    static currentStep=null;

    static myStep = cc.Enum({
        PREPARE_STEP: 0,//prepare to move chess step
        MOVING_STEP: 1,//in moving chess step
        GETRESULT_STEP: 2,//move finish and rooling to find could destory chess 
        DESTROY_STEP: 3,//destory finish move down and create new chess to fill the blank
        EXEC_DESTROY_STEP: 4,//execute destroy step
        MOVING_DOWN_STEP: 5,//fall down and fill board then back to step destroy
        JUDGE_FALLDOWN_POSMAP_STEP: 6,//local pos-name posmap before falldown
        EXEC_FALLDOWN_STEP: 7,//excute falldown 
        CREATE_NEW_CHESS_STEP: 8,//create new chess
        WAIT_FORFILL_STEP: 9,//wait chess fill all the board
        JUDGE_DAMGE_HEAL_STEP: 10,//the calculate damage and heal step
        MOVING_TONEXTSTAGE_STEP: 11,//moving to next stage
        GAME_RESULT_STEP: 12,//to get game result (game over or win)
        GAME_PAUSE_STEP: 99//pause
    });
}