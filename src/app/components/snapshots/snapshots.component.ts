import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { ConfigSnapshot, ConfigSnapshotData, Application, Environment } from '../../models/config.models';

@Component({
  selector: 'app-snapshots',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Configuration Snapshots</h2>
        <button
          (click)="showCreateModal = true"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Create Snapshot
        </button>
      </div>

      <!-- Environment Filter -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Environment</label>
        <select
          [(ngModel)]="selectedEnvironmentId"
          (ngModelChange)="loadSnapshots()"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option [value]="undefined">All Environments</option>
          <option *ngFor="let env of environments" [value]="env.id">{{ env.name }}</option>
        </select>
      </div>

      <!-- Snapshots List -->
      <div class="space-y-4">
        <div *ngFor="let snapshot of snapshots" class="border border-gray-200 rounded-lg p-4">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="text-lg font-medium text-gray-900">{{ snapshot.name }}</h3>
              <p *ngIf="snapshot.description" class="text-gray-600 mt-1">{{ snapshot.description }}</p>
              <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>{{ getEnvironmentName(snapshot.environment_id) }}</span>
                <span>{{ snapshot.snapshot_type }}</span>
                <span>{{ formatDate(snapshot.created_at) }}</span>
                <span>by {{ snapshot.created_by }}</span>
              </div>
            </div>
            <div class="flex space-x-2">
              <button
                (click)="viewSnapshot(snapshot)"
                class="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm"
              >
                View
              </button>
              <button
                (click)="showRestoreModal(snapshot)"
                class="text-green-600 hover:text-green-800 px-3 py-1 text-sm"
              >
                Restore
              </button>
              <button
                (click)="deleteSnapshot(snapshot.id)"
                class="text-red-600 hover:text-red-800 px-3 py-1 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="snapshots.length === 0" class="text-center py-8 text-gray-500">
          No snapshots found for this application.
        </div>
      </div>
    </div>

    <!-- Create Snapshot Modal -->
    <div *ngIf="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Create Configuration Snapshot</h3>

        <form (ngSubmit)="createSnapshot()">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Name *</label>
            <input
              type="text"
              [(ngModel)]="newSnapshot.name"
              name="name"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Production Release v1.2.0"
            >
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              [(ngModel)]="newSnapshot.description"
              name="description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional description..."
            ></textarea>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Environment *</label>
            <select
              [(ngModel)]="newSnapshot.environment_id"
              name="environment_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Environment</option>
              <option *ngFor="let env of environments" [value]="env.id">{{ env.name }}</option>
            </select>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              [(ngModel)]="newSnapshot.snapshot_type"
              name="snapshot_type"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MANUAL">Manual</option>
              <option value="DEPLOYMENT">Deployment</option>
              <option value="BACKUP">Backup</option>
            </select>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              (click)="cancelCreate()"
              class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="!newSnapshot.name || !newSnapshot.environment_id"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Snapshot
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Snapshot Modal -->
    <div *ngIf="showViewModal && selectedSnapshot" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">{{ selectedSnapshot.name }}</h3>
          <button (click)="closeViewModal()" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto">
          <div *ngIf="snapshotData.length > 0" class="space-y-4">
            <div *ngFor="let group of getGroupedSnapshotData()" class="border border-gray-200 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">{{ group.file }} {{ group.group ? '- ' + group.group : '' }}</h4>
              <div class="space-y-2">
                <div *ngFor="let item of group.items" class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span class="font-mono text-sm">{{ item.key_name }}</span>
                  <span class="text-sm text-gray-600" [class.text-yellow-600]="item.is_sensitive">
                    {{ item.is_sensitive ? '[SENSITIVE]' : (item.value || '[empty]') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div *ngIf="snapshotData.length === 0" class="text-center py-8 text-gray-500">
            No configuration data in this snapshot.
          </div>
        </div>
      </div>
    </div>

    <!-- Restore Modal -->
    <div *ngIf="showRestoreConfirm && selectedSnapshot" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Restore Configuration</h3>
        <p class="text-gray-600 mb-4">
          This will restore configurations from "{{ selectedSnapshot.name }}" to the selected environment.
          Existing values will be overwritten.
        </p>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Target Environment *</label>
          <select
            [(ngModel)]="restoreTargetEnvironmentId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Environment</option>
            <option *ngFor="let env of environments" [value]="env.id">{{ env.name }}</option>
          </select>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            (click)="closeRestoreModal()"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            (click)="confirmRestore()"
            [disabled]="!restoreTargetEnvironmentId"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Restore
          </button>
        </div>
      </div>
    </div>
  `
})
export class SnapshotsComponent implements OnInit {
  @Input() application!: Application;
  @Input() environments: Environment[] = [];

  snapshots: ConfigSnapshot[] = [];
  snapshotData: ConfigSnapshotData[] = [];
  selectedSnapshot: ConfigSnapshot | null = null;
  selectedEnvironmentId: number | undefined;

  showCreateModal = false;
  showViewModal = false;
  showRestoreConfirm = false;
  restoreTargetEnvironmentId: number | null = null;

  newSnapshot = {
    name: '',
    description: '',
    environment_id: null as number | null,
    snapshot_type: 'MANUAL' as 'MANUAL' | 'DEPLOYMENT' | 'BACKUP'
  };

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadSnapshots();
  }

  async loadSnapshots() {
    try {
      this.snapshots = await this.supabaseService.getSnapshots(
        this.application.id,
        this.selectedEnvironmentId
      );
    } catch (error) {
      console.error('Error loading snapshots:', error);
    }
  }

  async createSnapshot() {
    if (!this.newSnapshot.name || !this.newSnapshot.environment_id) return;

    try {
      await this.supabaseService.createSnapshot({
        name: this.newSnapshot.name,
        description: this.newSnapshot.description || undefined,
        application_id: this.application.id,
        environment_id: this.newSnapshot.environment_id,
        snapshot_type: this.newSnapshot.snapshot_type
      });

      await this.loadSnapshots();
      this.cancelCreate();
    } catch (error) {
      console.error('Error creating snapshot:', error);
    }
  }

  cancelCreate() {
    this.showCreateModal = false;
    this.newSnapshot = {
      name: '',
      description: '',
      environment_id: null,
      snapshot_type: 'MANUAL'
    };
  }

  async viewSnapshot(snapshot: ConfigSnapshot) {
    this.selectedSnapshot = snapshot;
    try {
      this.snapshotData = await this.supabaseService.getSnapshotData(snapshot.id);
      this.showViewModal = true;
    } catch (error) {
      console.error('Error loading snapshot data:', error);
    }
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedSnapshot = null;
    this.snapshotData = [];
  }

  showRestoreModal(snapshot: ConfigSnapshot) {
    this.selectedSnapshot = snapshot;
    this.restoreTargetEnvironmentId = null;
    this.showRestoreConfirm = true;
  }

  closeRestoreModal() {
    this.showRestoreConfirm = false;
    this.selectedSnapshot = null;
    this.restoreTargetEnvironmentId = null;
  }

  async confirmRestore() {
    if (!this.selectedSnapshot || !this.restoreTargetEnvironmentId) return;

    try {
      await this.supabaseService.restoreFromSnapshot(
        this.selectedSnapshot.id,
        this.restoreTargetEnvironmentId
      );
      this.closeRestoreModal();
    } catch (error) {
      console.error('Error restoring snapshot:', error);
    }
  }

  async deleteSnapshot(snapshotId: number) {
    if (!confirm('Are you sure you want to delete this snapshot?')) return;

    try {
      await this.supabaseService.deleteSnapshot(snapshotId);
      await this.loadSnapshots();
    } catch (error) {
      console.error('Error deleting snapshot:', error);
    }
  }

  getEnvironmentName(environmentId: number): string {
    const env = this.environments.find(e => e.id === environmentId);
    return env?.name || 'Unknown';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }

  getGroupedSnapshotData() {
    const groups: { file: string; group: string | null; items: ConfigSnapshotData[] }[] = [];

    this.snapshotData.forEach(item => {
      let group = groups.find(g =>
        g.file === item.config_file_name && g.group === item.group_name
      );

      if (!group) {
        group = {
          file: item.config_file_name,
          group: item.group_name,
          items: []
        };
        groups.push(group);
      }

      group.items.push(item);
    });

    return groups.sort((a, b) => {
      const fileCompare = a.file.localeCompare(b.file);
      if (fileCompare !== 0) return fileCompare;

      const aGroup = a.group || '';
      const bGroup = b.group || '';
      return aGroup.localeCompare(bGroup);
    });
  }
}