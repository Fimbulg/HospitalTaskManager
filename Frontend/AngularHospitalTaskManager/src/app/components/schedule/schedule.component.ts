import { Component, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy, Input } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Procedure, Staff, Service, Schedule, ScheduledProcedure, ProcedureStatus, Procedure_Schedule, Department, AllData } from '../../services/schedule.service';
import Query from "devextreme/data/query"
import { locale} from 'devextreme/localization';
import DataSource from "devextreme/data/data_source";
import { isNullOrUndefined } from 'util';

@Component({
    selector: 'app-schedule',
    templateUrl: './schedule.component.html',
    styleUrls: ['./schedule.component.css'],
    providers: [Service],
    //changeDetection: ChangeDetectionStrategy.OnPush
})

export class ScheduleComponent {
    allData:AllData;
    departmentData: Department[];
    procedureData: Procedure[];
    scheduleData: Schedule[];
    procedure_scheduleData:Procedure_Schedule[];
    /*
    *  om du skallanvända denna som dataSource i dvx-schedule-komponenten
    *  så måste det var en DataSource se längre ner hur du gör detta 
    */
    scheduledProcedureData: ScheduledProcedure[];
    statusData: ProcedureStatus[];
    staffData: Staff[];
    scheduledStaff: Staff[];

    //currentDate: Date = new Date();
    currentDate:Date = new Date("2020-05-16 11:00");
    mockDate:Date = new Date("2020-05-16");

    isLoaded:boolean;
    isWorkTimeLoaded:boolean;
    
    showCurrentTimeIndicator = true;
    shadeUntilCurrentTime = true;

    @Input() datacells;
    cellData:{staffId:number, startDate:Date, endDate:Date}[] = [];
    ds:DataSource;

    constructor(private service: Service) {
    }

    polling: any;
    ngOnInit() {
        this.AzynkronusKonztraaktor();
        setTimeout(() => {this.RestOfShit();}, 1500);
        
        this.ds = new DataSource({

        });
        
    }

    async AzynkronusKonztraaktor(){
        await this.GetStaffAsync();
    }

    async GetStaffAsync(){
        const staffCall = this.service.GetStaff();
        const scheduleCall = this.service.getSchedule(this.mockDate);
        const procedureCall = this.service.getProcedures(this.mockDate);
        const procedure_scheduleCall = this.service.getProcedure_Schedule(this.mockDate);
        
        await staffCall.toPromise().then( data => {
            this.staffData = data.map(
                staff => {
                    return {
                        firstName: staff.FirstName,
                        lastName: staff.LastName,
                        id: staff.ID,
                        departmentId: staff.DepartmentId,
                        phoneNr: staff.PhoneNr,
                        onSite: staff.OnSite
                    }
                }
            )
        });
        console.log (this.staffData); 
        await scheduleCall.toPromise().then( data => {
            this.scheduleData = data.map(
                res => {
                    return {
                        startDate: res.StartDate,
                        endDate: res.EndDate,
                        id: res.ID,
                        staffId: res.StaffID
                    }
                }
            )
        });
        console.log (this.scheduleData);
        await procedureCall.toPromise().then( data => {
            this.procedureData = data.map(
                res => {
                    return {
                        id: res.ID,
                        deptId: res.DepartmentId,
                        text: res.ProcedureName,
                        startDate: res.StartDate,
                        endDate: res.EndDate,
                        isHandled: res.isHandled
                    }
                }
            )
        });
        console.log(this.procedureData);
        await procedure_scheduleCall.toPromise().then( data => {
            this.procedure_scheduleData = data.map(
                res => {
                    return {
                        procedureId: res.ProcedureId,
                        scheduleId: res.ScheduleId,
                        keyPerson: res.KeyPerson
                    }
                }
            )
        });      
        console.log(this.procedure_scheduleData);     
    }

    RestOfShit(){
        this.statusData = this.service.getStatus();
        /*
        * gör om till this.scheduledProcedureData = new DataSource({ store: this.getScheduledProcedures()});
        */
        this.scheduledProcedureData = this.getScheduledProcedures();
        this.scheduledStaff = this.GetScheduledStaff();
        locale(navigator.language);
        this.CheckProcedureStatus();
        this.polling = setInterval(() => { this.CheckProcedureStatus(); }, 60000);
        this.isLoaded = true;
        this.isWorkTimeLoaded = false;
        this.GenerateCellData();
    }

    ngOnDestroy() {
        clearInterval(this.polling);
    }

    DisableClickEvent(e){
        e.cancel = true;
    }

    DisableAppointmentForm(e){
        e.component._popup.hide();
    }

    MarkProcedureAsHandled(id:number):void {
        let procedure = this.GetProcedure(id);
        this.service.MarkProcedureAsHandled(id, procedure).subscribe();
        this.CheckProcedureStatus();
    }

    GetScheduledStaff():Staff[]{
        return this.staffData.filter(s => this.scheduleData.map(a => a.staffId).includes(s.id));
    }
    
    GetEmployee(id:number){
        return Query(this.staffData).filter(["id", "=", id]).toArray()[0];
    }

    GetStaffPresenceStatus(id:number){
        return Query(this.scheduleData).filter(["staffId", "=", id]).toArray()[0];
    }

    GetProcedureStatus(id:number){
        return Query(this.statusData).filter(["id", "=", id]).toArray()[0];
    }

    GetProcedure(id:number){
        return this.procedureData.find(p => p.id == id);
    }
    
    CheckProcedureStatus() {
        this.scheduledProcedureData.forEach(p => {
            let staff = this.staffData.filter(item => p.staffId.includes(item.id));

            if (p.startDate > this.currentDate) {
                p.statusId = 1;
            }
            if(p.isHandled == true){
                p.statusId = 1;
            }
            else if (staff.find(item => item.onSite == false)) {
                if (Date.parse(p.startDate.toString()) < this.currentDate.getTime()) {
                    p.statusId = 3;
                    //TODO SEN kanske se till att 3600000 är justerbar till preferens ist för fast siffra. DB-post?
                    //Signalera bakänden att problemz sker
                }
                else if(Date.parse(p.startDate.toString()) < this.currentDate.getTime() + 3600000){
                    p.statusId = 2;
                }
            }
        })
    }

    GetDataCells(data){
        let cell: {staffId:number, startDate:Date, endDate:Date}
        try {
            if(isNullOrUndefined(this.cellData ) || data.groups.staffId < this.cellData[this.cellData.length - 1].staffId){

                cell = {
                    staffId: data.groups.staffId,
                    startDate: data.startDate,
                    endDate: data.endDate
                }
                this.cellData.push(cell);
            }
        } catch (error) {
            console.log(error);
        }
    }

    GenerateCellData(){
        let minutes = 15;
        let celldata = [];
        let tt = 0;
        
        for (let i = 0; i < this.scheduledStaff.length; i++) {
            const staff = this.scheduledStaff[i];
            let staffId = i + 1;
            for (let j = 0; tt < 24; j++) {
                let hh = Math.floor(tt/60);
                let mm = tt%60;
                celldata.push(("0" + hh ).slice(-2) + ':' + ("0" + mm).slice(-2));
                tt = tt + minutes;
            }
        }
        console.log(celldata);
    }

    GetWorkHours(data){

        let classObject = {};
        let className: string = "";
        classObject[this.IsWorkHours(data, className)] = true;
        console.log("hej")
        return classObject;
    }

    IsWorkHour(id:number){
        let schedule:Schedule = this.scheduleData.find(s => s.staffId == id);
        let staff:Staff = this.staffData.find(s => s.id == id)
        if(Date.parse(schedule.startDate.toString()) <= this.currentDate.getTime() 
        && Date.parse(schedule.endDate.toString()) >= this.currentDate.getTime() && staff.onSite == true){
            return "inside";
        }
        else if(Date.parse(schedule.startDate.toString()) >= this.currentDate.getTime()
        || Date.parse(schedule.endDate.toString()) <= this.currentDate.getTime() && staff.onSite == true){
            return "outside";
        }
        else{
            return "not";
        }
    }

    IsWorkHours(data:any, className:string) {
        let schedule = this.scheduleData.find(s => s.staffId === data.groups.staffId);
        if(this.IsWorkHour(data.groups.staffId) === "inside" && schedule != null){
            if (Date.parse(schedule.startDate.toString()) < data.endDate.getTime() 
            && data.startDate.getTime() < Date.parse(schedule.endDate.toString())){
                if(data.startDate.getTime() <= Date.parse(schedule.startDate.toString()) ){
                    className="workTimeStart";
                }
                else{
                    className="workTime";
                }
                return className;
            }
            else{
                if(data.startDate.getTime() <= Date.parse(schedule.endDate.toString()) 
                && data.startDate.getTime() >= Date.parse(schedule.startDate.toString()))
                    className="workTimeEnded";
                else
                    className="notWorkTime";
                return className;
            }
        }
        else if(schedule != null){
            if (Date.parse(schedule.startDate.toString()) < data.endDate.getTime() 
            && data.startDate.getTime() < Date.parse(schedule.endDate.toString())){
                if(data.startDate.getTime() <= Date.parse(schedule.startDate.toString()) ){
                    className="workTimeStartNotOnSite";
                }
                else{
                    className="workTimeNotOnSite";
                }
                return className;
            }
            else{
                if(data.startDate.getTime() <= Date.parse(schedule.endDate.toString()) 
                && data.startDate.getTime() >= Date.parse(schedule.startDate.toString()))
                    className="workTimeEndedNotOnSite";
                else
                    className="notWorkTime";
                return className;
            }
        }
    }

    getScheduledProcedures() {
        let scheduledProcedureData: ScheduledProcedure[] = [];
        for (let i = 0; i < this.procedure_scheduleData.length; i++) {
            const element = this.procedure_scheduleData[i];

            let procedure = this.procedureData.find(p => p.id == element.procedureId);
            let schedule = this.procedure_scheduleData.filter(p => p.procedureId == element.procedureId);

            let scheduleIds: number[] = [];

            for (let j = 0; j < schedule.length; j++) {
                try {
                    const s = schedule[j];
                    let staffSchedule = this.scheduleData.find(q => q.id == s.scheduleId);
                    scheduleIds.push(staffSchedule.staffId);
                } catch (error) {
                    console.log(error);
                }
            }

            if (procedure != null) {
                let scheduledProcedure = new ScheduledProcedure();

                scheduledProcedure = {
                    id: i,
                    text: procedure.text,
                    startDate: procedure.startDate,
                    endDate: procedure.endDate,
                    staffId: scheduleIds,
                    procedureId: procedure.id,
                    isHandled: procedure.isHandled,
                    statusId: 1
                }
                scheduledProcedureData.push(scheduledProcedure);
            }
        }
        console.log(scheduledProcedureData.filter((obj, index, self) => self.findIndex(s => s.procedureId === obj.procedureId) === index));
        return scheduledProcedureData.filter((obj, index, self) => self.findIndex(s => s.procedureId === obj.procedureId) === index);
    }
}
