// src/app/admin/subscribers/SubscriberList.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { Switch, Select, Table, Button, Input, Modal, Form, message, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

interface Subscriber {
  _id: string;
  email: string;
  name?: string;
  subscriptionDate: string;
  isActive: boolean;
  tags?: string[];
}

const SubscriberList = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingSubscriberId, setEditingSubscriberId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchSubscribers = async (page = 1, pageSize = 10) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/subscribers?page=${page}&limit=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Dodaj token autoryzacyjny
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch subscribers');
      }
      const data = await response.json();
      setSubscribers(data.data);
      setPagination({
        ...pagination,
        current: page,
        pageSize: pageSize,
        total: data.pagination.total
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił nieznany błąd';
      setError(errorMessage);
      message.error(`Błąd podczas pobierania subskrybentów: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleTableChange = (pagination: any) => {
    fetchSubscribers(pagination.current, pagination.pageSize);
  };

  const handleAddSubscriber = () => {
    setEditingSubscriberId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditSubscriber = (subscriber: Subscriber) => {
    setEditingSubscriberId(subscriber._id);
    form.setFieldsValue(subscriber);
    setIsModalVisible(true);
  };

  const handleDeleteSubscriber = async (id: string) => {
    try {
      await fetch(`/api/subscribers/${id}`, { method: 'DELETE' });
      message.success('Subscriber deleted successfully');
      fetchSubscribers();
    } catch (error) {
      message.error('Failed to delete subscriber');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingSubscriberId) {
        await fetch(`/api/subscribers/${editingSubscriberId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
      } else {
        await fetch('/api/subscribers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
      }
      setIsModalVisible(false);
      message.success(`Subscriber ${editingSubscriberId ? 'updated' : 'added'} successfully`);
      fetchSubscribers();
    } catch (error) {
      message.error('Failed to submit form');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      fetchSubscribers();
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/subscribers/search?query=${searchTerm}`);
      if (!response.ok) throw new Error('Failed to search subscribers');
      const data = await response.json();
      setSubscribers(data.data);
    } catch (err) {
      setError('Error searching subscribers');
      console.error('Error searching subscribers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Subscription Date',
      dataIndex: 'subscriptionDate',
      key: 'subscriptionDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Tags',
      key: 'tags',
      dataIndex: 'tags',
      render: (tags: string[]) => (
        <>
          {tags?.map(tag => (
            <Tag color="blue" key={tag}>
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Subscriber) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => handleEditSubscriber(record)} />
          <Popconfirm
            title="Are you sure you want to delete this subscriber?"
            onConfirm={() => handleDeleteSubscriber(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} />
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div>
      <h1>Subscriber Management</h1>
      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search subscribers"
          onSearch={handleSearch}
          style={{ width: 200, marginRight: 16 }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSubscriber}>
          Add Subscriber
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={subscribers}
        rowKey="_id"
        loading={isLoading}
        pagination={pagination}
        onChange={handleTableChange}
      />
      <Modal
        title={editingSubscriberId ? "Edit Subscriber" : "Add Subscriber"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Name">
            <Input />
          </Form.Item>
          <Form.Item name="isActive" label="Status" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="tags" label="Tags">
            <Select mode="tags" style={{ width: '100%' }} placeholder="Tags">
              <Option value="newsletter">Newsletter</Option>
              <Option value="promotions">Promotions</Option>
              <Option value="updates">Updates</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubscriberList;