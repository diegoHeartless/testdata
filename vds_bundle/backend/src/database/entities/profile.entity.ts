import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiKeyEntity } from './api-key.entity';
import { ExportEntity } from './export.entity';

@Entity({ name: 'profiles' })
export class ProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ name: 'source_key_id', type: 'uuid', nullable: true })
  sourceKeyId?: string;

  @ManyToOne(() => ApiKeyEntity, (apiKey) => apiKey.profiles, { nullable: true })
  @JoinColumn({ name: 'source_key_id' })
  sourceKey?: ApiKeyEntity;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'now()' })
  updatedAt: Date;

  @OneToMany(() => ExportEntity, (exportEntity) => exportEntity.profile)
  exports?: ExportEntity[];
}


