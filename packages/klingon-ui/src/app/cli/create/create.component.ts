import { FlagsComponent } from './../flags/flags.component';
import { CliService } from './../cli.service';
import { Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-cli-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css', '../flags/flags.component.css']
})
export class CliCreateComponent extends FlagsComponent implements OnInit {
  form: FormGroup;
  styleExt = ['css', 'scss', 'less', 'sass', 'styl'];

  constructor(public cli: CliService) {
    super();
  }

  ngOnInit() {
    this.form = this.buildForm(FlagsComponent.Flags.CREATE);
  }

  dryRun() {
    this.run('--dry-run=true');
  }

  create() {
    this.run();
  }

  run(extra = '') {
    // save project directory to local storage to remember next time
    const rootDir = this.form.value['root-dir'];
    localStorage.setItem('ui.lastUsedRootDirectory', rootDir || '');

    this.isWorking = true;
    const command$ = this.cli
      .runNgCommand(
        `new ${this.form.value['app-name']} ${this.cli.serialize(
          this.form.value
        )} ${extra}`,
        rootDir
      );

    command$.subscribe(data => {
      if (data.stderr) {
        this.onStdErr.next(data.stderr);
      } else {
        this.onStdOut.next(data.stdout);
      }
    });

    command$
      .pipe(
        filter(data => data.stdout && data.stdout.indexOf('Successfully initialized git') !== -1)
      ).subscribe(data => {
        this.isWorking = false;
      });
  }
}
