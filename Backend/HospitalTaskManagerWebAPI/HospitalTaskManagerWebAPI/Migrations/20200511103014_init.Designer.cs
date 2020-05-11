﻿// <auto-generated />
using System;
using HospitalTaskManagerWebAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace HospitalTaskManagerWebAPI.Migrations
{
    [DbContext(typeof(HospitalTaskManagerContext))]
    [Migration("20200511103014_init")]
    partial class init
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.2.6-servicing-10079")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("HospitalTaskManagerWebAPI.Models.Department", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("DepartmentName");

                    b.HasKey("ID");

                    b.ToTable("Departments");

                    b.HasData(
                        new
                        {
                            ID = 1,
                            DepartmentName = "Coola avdelningen"
                        },
                        new
                        {
                            ID = 2,
                            DepartmentName = "Mindre coola avdelningen"
                        });
                });

            modelBuilder.Entity("HospitalTaskManagerWebAPI.Models.Procedure", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("DepartmentId");

                    b.Property<DateTime>("EndDate");

                    b.Property<bool>("IsHandled");

                    b.Property<string>("ProcedureName");

                    b.Property<DateTime>("StartDate");

                    b.HasKey("ID");

                    b.HasIndex("DepartmentId");

                    b.ToTable("Procedures");
                });

            modelBuilder.Entity("HospitalTaskManagerWebAPI.Models.Schedule", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<DateTime>("EndDate");

                    b.Property<int>("StaffID");

                    b.Property<DateTime>("StartDate");

                    b.HasKey("ID");

                    b.HasIndex("StaffID");

                    b.ToTable("Schedules");
                });

            modelBuilder.Entity("HospitalTaskManagerWebAPI.Models.ScheduledProcedure", b =>
                {
                    b.Property<int>("ScheduleId");

                    b.Property<int>("ProcedureId");

                    b.Property<bool>("KeyPerson");

                    b.HasKey("ScheduleId", "ProcedureId");

                    b.HasIndex("ProcedureId");

                    b.ToTable("ScheduledProcedures");
                });

            modelBuilder.Entity("HospitalTaskManagerWebAPI.Models.Staff", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("DepartmentId");

                    b.Property<string>("FirstName");

                    b.Property<string>("LastName");

                    b.Property<bool>("OnSite");

                    b.Property<string>("PhoneNr");

                    b.HasKey("ID");

                    b.HasIndex("DepartmentId");

                    b.ToTable("Staffs");

                    b.HasData(
                        new
                        {
                            ID = 1,
                            DepartmentId = 1,
                            FirstName = "Benjamin",
                            LastName = "Ek",
                            OnSite = true,
                            PhoneNr = "0227896541"
                        },
                        new
                        {
                            ID = 2,
                            DepartmentId = 2,
                            FirstName = "Malin",
                            LastName = "Jönsson",
                            OnSite = true,
                            PhoneNr = "0227896541"
                        });
                });

            modelBuilder.Entity("HospitalTaskManagerWebAPI.Models.Procedure", b =>
                {
                    b.HasOne("HospitalTaskManagerWebAPI.Models.Department", "Department")
                        .WithMany("Procedures")
                        .HasForeignKey("DepartmentId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("HospitalTaskManagerWebAPI.Models.Schedule", b =>
                {
                    b.HasOne("HospitalTaskManagerWebAPI.Models.Staff", "Staff")
                        .WithMany("Schedules")
                        .HasForeignKey("StaffID")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("HospitalTaskManagerWebAPI.Models.ScheduledProcedure", b =>
                {
                    b.HasOne("HospitalTaskManagerWebAPI.Models.Procedure", "Procedure")
                        .WithMany("ScheduledProcedures")
                        .HasForeignKey("ProcedureId")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.HasOne("HospitalTaskManagerWebAPI.Models.Schedule", "Schedule")
                        .WithMany("ScheduledProcedures")
                        .HasForeignKey("ScheduleId")
                        .OnDelete(DeleteBehavior.Restrict);
                });

            modelBuilder.Entity("HospitalTaskManagerWebAPI.Models.Staff", b =>
                {
                    b.HasOne("HospitalTaskManagerWebAPI.Models.Department", "Department")
                        .WithMany("Staffs")
                        .HasForeignKey("DepartmentId")
                        .OnDelete(DeleteBehavior.Cascade);
                });
#pragma warning restore 612, 618
        }
    }
}
